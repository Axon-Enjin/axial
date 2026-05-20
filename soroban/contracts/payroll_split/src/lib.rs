#![no_std]

use soroban_sdk::{
    contract, contracterror, contractevent, contractimpl, contracttype, token, Address, Env,
    String,
};

/// Emitted after a successful `route_payroll` (compliance oracle can subscribe).
#[contractevent]
pub struct PayrollRouted {
    #[topic]
    pub payroll_id: String,
    pub payer: Address,
    pub gross_amount: i128,
    pub sss_amount: i128,
    pub philhealth_amount: i128,
    pub pagibig_amount: i128,
    pub net_amount: i128,
    pub ledger: u32,
}

const MAX_BPS: u32 = 10_000;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PayrollQuote {
    pub sss_amount: i128,
    pub philhealth_amount: i128,
    pub pagibig_amount: i128,
    pub net_amount: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PayrollRecord {
    pub payer: Address,
    pub gross_amount: i128,
    pub sss_amount: i128,
    pub philhealth_amount: i128,
    pub pagibig_amount: i128,
    pub net_amount: i128,
    pub ledger: u32,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Usdc,
    Sss,
    Philhealth,
    Pagibig,
    Employees,
    SssBps,
    PhilhealthBps,
    PagibigBps,
    Initialized,
    Payroll(String),
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    PayrollNotFound = 3,
    AlreadyRouted = 4,
    InvalidAmount = 5,
    InvalidBps = 6,
}

#[contract]
pub struct PayrollSplit;

#[contractimpl]
impl PayrollSplit {
    /// One-time setup: USDC asset + whitelisted agency addresses + demo split rates (bps).
    /// `sss_bps + philhealth_bps + pagibig_bps` must be under 10_000; remainder is net pay to `employees`.
    pub fn initialize(
        env: Env,
        admin: Address,
        usdc: Address,
        sss: Address,
        philhealth: Address,
        pagibig: Address,
        employees: Address,
        sss_bps: u32,
        philhealth_bps: u32,
        pagibig_bps: u32,
    ) -> Result<(), Error> {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(Error::AlreadyInitialized);
        }
        let statutory = sss_bps
            .saturating_add(philhealth_bps)
            .saturating_add(pagibig_bps);
        if statutory == 0 || statutory >= MAX_BPS {
            return Err(Error::InvalidBps);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Usdc, &usdc);
        env.storage().instance().set(&DataKey::Sss, &sss);
        env.storage().instance().set(&DataKey::Philhealth, &philhealth);
        env.storage().instance().set(&DataKey::Pagibig, &pagibig);
        env.storage().instance().set(&DataKey::Employees, &employees);
        env.storage().instance().set(&DataKey::SssBps, &sss_bps);
        env.storage().instance().set(&DataKey::PhilhealthBps, &philhealth_bps);
        env.storage().instance().set(&DataKey::PagibigBps, &pagibig_bps);
        env.storage().instance().set(&DataKey::Initialized, &true);
        Ok(())
    }

    /// Preview statutory split for a gross payroll amount (stroops).
    pub fn quote(env: Env, gross_amount: i128) -> Result<PayrollQuote, Error> {
        Self::require_init(&env)?;
        if gross_amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        Ok(Self::compute_quote(&env, gross_amount))
    }

    /// MSME payer authorizes; USDC is split from payer to agencies + employee pool. One route per `payroll_id`.
    pub fn route_payroll(
        env: Env,
        payer: Address,
        payroll_id: String,
        gross_amount: i128,
    ) -> Result<PayrollRecord, Error> {
        Self::require_init(&env)?;
        payer.require_auth();

        let payroll_key = DataKey::Payroll(payroll_id.clone());
        if env.storage().instance().has(&payroll_key) {
            return Err(Error::AlreadyRouted);
        }

        let quote = Self::quote(env.clone(), gross_amount)?;
        let usdc: Address = env.storage().instance().get(&DataKey::Usdc).unwrap();
        let sss: Address = env.storage().instance().get(&DataKey::Sss).unwrap();
        let philhealth: Address = env.storage().instance().get(&DataKey::Philhealth).unwrap();
        let pagibig: Address = env.storage().instance().get(&DataKey::Pagibig).unwrap();
        let employees: Address = env.storage().instance().get(&DataKey::Employees).unwrap();

        let token = token::Client::new(&env, &usdc);
        if quote.sss_amount > 0 {
            token.transfer(&payer, &sss, &quote.sss_amount);
        }
        if quote.philhealth_amount > 0 {
            token.transfer(&payer, &philhealth, &quote.philhealth_amount);
        }
        if quote.pagibig_amount > 0 {
            token.transfer(&payer, &pagibig, &quote.pagibig_amount);
        }
        if quote.net_amount > 0 {
            token.transfer(&payer, &employees, &quote.net_amount);
        }

        let record = PayrollRecord {
            payer: payer.clone(),
            gross_amount,
            sss_amount: quote.sss_amount,
            philhealth_amount: quote.philhealth_amount,
            pagibig_amount: quote.pagibig_amount,
            net_amount: quote.net_amount,
            ledger: env.ledger().sequence(),
        };

        env.storage().instance().set(&payroll_key, &record);

        PayrollRouted {
            payroll_id: payroll_id.clone(),
            payer: payer.clone(),
            gross_amount,
            sss_amount: record.sss_amount,
            philhealth_amount: record.philhealth_amount,
            pagibig_amount: record.pagibig_amount,
            net_amount: record.net_amount,
            ledger: record.ledger,
        }
        .publish(&env);

        Ok(record)
    }

    pub fn get_payroll(env: Env, payroll_id: String) -> Result<PayrollRecord, Error> {
        Self::require_init(&env)?;
        env.storage()
            .instance()
            .get(&DataKey::Payroll(payroll_id))
            .ok_or(Error::PayrollNotFound)
    }
}

impl PayrollSplit {
    fn require_init(env: &Env) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Initialized) {
            Ok(())
        } else {
            Err(Error::NotInitialized)
        }
    }

    fn compute_quote(env: &Env, gross_amount: i128) -> PayrollQuote {
        let bps_den = MAX_BPS as i128;
        let sss_bps: u32 = env.storage().instance().get(&DataKey::SssBps).unwrap();
        let phil_bps: u32 = env.storage().instance().get(&DataKey::PhilhealthBps).unwrap();
        let pagibig_bps: u32 = env.storage().instance().get(&DataKey::PagibigBps).unwrap();
        let sss_bps = sss_bps as i128;
        let phil_bps = phil_bps as i128;
        let pagibig_bps = pagibig_bps as i128;

        let sss_amount = gross_amount * sss_bps / bps_den;
        let philhealth_amount = gross_amount * phil_bps / bps_den;
        let pagibig_amount = gross_amount * pagibig_bps / bps_den;
        let net_amount = gross_amount - sss_amount - philhealth_amount - pagibig_amount;

        PayrollQuote {
            sss_amount,
            philhealth_amount,
            pagibig_amount,
            net_amount,
        }
    }
}

mod test;
