#![no_std]

//! Settlement contract — CLS-06/07/08
//!
//! Serves as the per-invoice lockbox. Payer sends USDC directly to this
//! contract's address (keyed by invoice_id memo). Admin calls `settle` once
//! payment lands; contract distributes:
//!   advance_paid  → funder  (principal repayment)
//!   remainder     → msme    (reserve release + margin)
//! If collected < advance_paid the shortfall is recorded as leakage and
//! recourse is triggered (state transition only; enforcement is off-chain).
//!
//! AUTH_REQUIRED on the USDC asset + clawback is handled at the SAC level
//! (receivable_token AUTH_REQUIRED). The settlement contract itself is
//! permission-less after initialization — only the admin address may call
//! settle / report_leakage.

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env,
    String,
};

// ── Events ────────────────────────────────────────────────────────────────────

#[contractevent]
pub struct InvoiceRegistered {
    #[topic]
    pub invoice_id: String,
    pub funder: Address,
    pub msme: Address,
    pub face_amount: i128,
    pub advance_amount: i128,
}

#[contractevent]
pub struct SettlementCompleted {
    #[topic]
    pub invoice_id: String,
    pub collected: i128,
    pub repaid_funder: i128,
    pub released_msme: i128,
    pub shortfall: i128,
    pub ledger: u32,
}

#[contractevent]
pub struct LeakageReported {
    #[topic]
    pub invoice_id: String,
    pub advance_at_risk: i128,
    pub ledger: u32,
}

// ── Types ─────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LockboxStatus {
    Open,
    Settled,
    Leaked,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct LockboxRecord {
    pub invoice_id: String,
    pub funder: Address,
    pub msme: Address,
    pub face_amount: i128,
    pub advance_amount: i128,
    pub reserve_amount: i128,
    pub collected_amount: i128,
    pub shortfall: i128,
    pub status: LockboxStatus,
    pub registered_ledger: u32,
    pub settled_ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Usdc,
    Initialized,
    Lockbox(String),
}

// ── Errors ────────────────────────────────────────────────────────────────────

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    LockboxNotFound = 3,
    AlreadyRegistered = 4,
    AlreadySettled = 5,
    Unauthorized = 6,
    InvalidAmount = 7,
}

// ── Contract ──────────────────────────────────────────────────────────────────

#[contract]
pub struct Settlement;

#[contractimpl]
impl Settlement {
    /// One-time setup. `admin` is the Axial server key (custodial signer).
    pub fn initialize(env: Env, admin: Address, usdc: Address) -> Result<(), Error> {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Usdc, &usdc);
        env.storage().instance().set(&DataKey::Initialized, &true);
        Ok(())
    }

    /// Called by admin immediately after `axial_swap::execute_advance`.
    /// Records the lockbox terms for this invoice. The settlement contract's
    /// own address is the payment destination — share it with the NoA.
    pub fn register_invoice(
        env: Env,
        admin: Address,
        invoice_id: String,
        funder: Address,
        msme: Address,
        face_amount: i128,
        advance_amount: i128,
    ) -> Result<LockboxRecord, Error> {
        Self::require_init(&env)?;
        Self::require_admin(&env, &admin)?;
        admin.require_auth();

        if face_amount <= 0 || advance_amount <= 0 || advance_amount > face_amount {
            return Err(Error::InvalidAmount);
        }

        let key = DataKey::Lockbox(invoice_id.clone());
        if env.storage().instance().has(&key) {
            return Err(Error::AlreadyRegistered);
        }

        let reserve = face_amount - advance_amount;
        let record = LockboxRecord {
            invoice_id: invoice_id.clone(),
            funder: funder.clone(),
            msme: msme.clone(),
            face_amount,
            advance_amount,
            reserve_amount: reserve,
            collected_amount: 0,
            shortfall: 0,
            status: LockboxStatus::Open,
            registered_ledger: env.ledger().sequence(),
            settled_ledger: 0,
        };

        env.storage().instance().set(&key, &record);

        InvoiceRegistered {
            invoice_id: invoice_id.clone(),
            funder,
            msme,
            face_amount,
            advance_amount,
        }
        .publish(&env);

        Ok(record)
    }

    /// Admin calls this once payer payment is detected in the lockbox.
    /// Distributes USDC from the contract's own balance:
    ///   collected >= advance_amount → repay advance to funder, reserve to msme
    ///   collected < advance_amount  → send all to funder, log shortfall (leakage path)
    pub fn settle(
        env: Env,
        admin: Address,
        invoice_id: String,
        collected_amount: i128,
    ) -> Result<LockboxRecord, Error> {
        Self::require_init(&env)?;
        Self::require_admin(&env, &admin)?;
        admin.require_auth();

        if collected_amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let key = DataKey::Lockbox(invoice_id.clone());
        let mut record: LockboxRecord = env
            .storage()
            .instance()
            .get(&key)
            .ok_or(Error::LockboxNotFound)?;

        if record.status != LockboxStatus::Open {
            return Err(Error::AlreadySettled);
        }

        let usdc_addr: Address = env.storage().instance().get(&DataKey::Usdc).unwrap();
        let token = token::Client::new(&env, &usdc_addr);
        let contract_addr = env.current_contract_address();

        let (repaid_funder, released_msme, shortfall) =
            if collected_amount >= record.advance_amount {
                // Full recovery — funder gets back advance; MSME gets reserve + any surplus
                let to_msme = collected_amount - record.advance_amount;
                (record.advance_amount, to_msme, 0i128)
            } else {
                // Partial — funder gets what arrived, MSME gets nothing, shortfall recorded
                (collected_amount, 0i128, record.advance_amount - collected_amount)
            };

        if repaid_funder > 0 {
            token.transfer(&contract_addr, &record.funder, &repaid_funder);
        }
        if released_msme > 0 {
            token.transfer(&contract_addr, &record.msme, &released_msme);
        }

        record.collected_amount = collected_amount;
        record.shortfall = shortfall;
        record.status = if shortfall > 0 {
            LockboxStatus::Leaked
        } else {
            LockboxStatus::Settled
        };
        record.settled_ledger = env.ledger().sequence();

        env.storage().instance().set(&key, &record);

        SettlementCompleted {
            invoice_id: invoice_id.clone(),
            collected: collected_amount,
            repaid_funder,
            released_msme,
            shortfall,
            ledger: record.settled_ledger,
        }
        .publish(&env);

        Ok(record)
    }

    /// Admin reports leakage: invoice is past due and lockbox shows insufficient payment.
    /// Transitions status to Leaked and emits event (off-chain reconciliation takes over).
    pub fn report_leakage(
        env: Env,
        admin: Address,
        invoice_id: String,
    ) -> Result<LockboxRecord, Error> {
        Self::require_init(&env)?;
        Self::require_admin(&env, &admin)?;
        admin.require_auth();

        let key = DataKey::Lockbox(invoice_id.clone());
        let mut record: LockboxRecord = env
            .storage()
            .instance()
            .get(&key)
            .ok_or(Error::LockboxNotFound)?;

        if record.status != LockboxStatus::Open {
            return Err(Error::AlreadySettled);
        }

        record.status = LockboxStatus::Leaked;
        record.shortfall = record.advance_amount;
        env.storage().instance().set(&key, &record);

        LeakageReported {
            invoice_id,
            advance_at_risk: record.advance_amount,
            ledger: env.ledger().sequence(),
        }
        .publish(&env);

        Ok(record)
    }

    pub fn get_lockbox(env: Env, invoice_id: String) -> Result<LockboxRecord, Error> {
        Self::require_init(&env)?;
        env.storage()
            .instance()
            .get(&DataKey::Lockbox(invoice_id))
            .ok_or(Error::LockboxNotFound)
    }
}

impl Settlement {
    fn require_init(env: &Env) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Initialized) {
            Ok(())
        } else {
            Err(Error::NotInitialized)
        }
    }

    fn require_admin(env: &Env, caller: &Address) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        if caller != &admin {
            return Err(Error::Unauthorized);
        }
        Ok(())
    }
}

mod test;
