#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, Address, Env, String,
};

/// Emitted when a payer-confirmed invoice is tokenized (oracle / swap can subscribe).
#[contractevent]
pub struct ReceivableMinted {
    #[topic]
    pub invoice_id: String,
    pub msme: Address,
    pub face_amount: i128,
    pub ledger: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReceivableRecord {
    pub msme: Address,
    pub face_amount: i128,
    pub minted_ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Initialized,
    Receivable(String),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    ReceivableNotFound = 3,
    AlreadyMinted = 4,
    InvalidAmount = 5,
    Unauthorized = 6,
}

#[contract]
pub struct ReceivableToken;

#[contractimpl]
impl ReceivableToken {
    /// One-time setup. `admin` is the issuer (represents Axial after off-chain payer confirm + NoA).
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Initialized, &true);
        Ok(())
    }

    /// Mint a receivable for one invoice. Off-chain gate must pass before calling.
    pub fn mint(
        env: Env,
        issuer: Address,
        msme: Address,
        invoice_id: String,
        face_amount: i128,
    ) -> Result<ReceivableRecord, Error> {
        Self::require_init(&env)?;
        Self::require_issuer(&env, &issuer)?;
        issuer.require_auth();

        if face_amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let key = DataKey::Receivable(invoice_id.clone());
        if env.storage().instance().has(&key) {
            return Err(Error::AlreadyMinted);
        }

        let record = ReceivableRecord {
            msme: msme.clone(),
            face_amount,
            minted_ledger: env.ledger().sequence(),
        };

        env.storage().instance().set(&key, &record);

        ReceivableMinted {
            invoice_id: invoice_id.clone(),
            msme: msme.clone(),
            face_amount,
            ledger: record.minted_ledger,
        }
        .publish(&env);

        Ok(record)
    }

    pub fn is_minted(env: Env, invoice_id: String) -> Result<bool, Error> {
        Self::require_init(&env)?;
        Ok(env
            .storage()
            .instance()
            .has(&DataKey::Receivable(invoice_id)))
    }

    pub fn get_receivable(env: Env, invoice_id: String) -> Result<ReceivableRecord, Error> {
        Self::require_init(&env)?;
        env.storage()
            .instance()
            .get(&DataKey::Receivable(invoice_id))
            .ok_or(Error::ReceivableNotFound)
    }
}

impl ReceivableToken {
    fn require_init(env: &Env) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Initialized) {
            Ok(())
        } else {
            Err(Error::NotInitialized)
        }
    }

    fn require_issuer(env: &Env, issuer: &Address) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        if issuer != &admin {
            return Err(Error::Unauthorized);
        }
        Ok(())
    }
}

mod test;
