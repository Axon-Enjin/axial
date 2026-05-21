#![cfg(test)]

use super::{Error, PayrollSplit, PayrollSplitClient};
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token::{StellarAssetClient, TokenClient},
    Address, Env, String,
};

const SSS_BPS: u32 = 1_100;
const PHIL_BPS: u32 = 500;
const PAGIBIG_BPS: u32 = 200;

fn setup<'a>(
    env: &Env,
) -> (
    PayrollSplitClient<'a>,
    Address,
    Address,
    Address,
    Address,
    Address,
    Address,
    TokenClient<'a>,
) {
    env.mock_all_auths();

    let admin = Address::generate(env);
    let payer = Address::generate(env);
    let sss = Address::generate(env);
    let philhealth = Address::generate(env);
    let pagibig = Address::generate(env);
    let employees = Address::generate(env);

    let usdc_asset = env.register_stellar_asset_contract_v2(admin.clone());
    let usdc_id = usdc_asset.address();
    let sac = StellarAssetClient::new(env, &usdc_id);
    let token = TokenClient::new(env, &usdc_id);

    let contract_id = env.register(PayrollSplit, ());
    let client = PayrollSplitClient::new(env, &contract_id);

    client.initialize(
        &admin,
        &usdc_id,
        &sss,
        &philhealth,
        &pagibig,
        &employees,
        &SSS_BPS,
        &PHIL_BPS,
        &PAGIBIG_BPS,
    );
    sac.mint(&payer, &500_000_000);

    (
        client, admin, payer, sss, philhealth, pagibig, employees, token,
    )
}

#[test]
fn quote_splits_gross_at_configured_bps() {
    let env = Env::default();
    let (client, _, _, _, _, _, _, _) = setup(&env);

    let q = client.quote(&100_000);
    assert_eq!(q.sss_amount, 11_000);
    assert_eq!(q.philhealth_amount, 5_000);
    assert_eq!(q.pagibig_amount, 2_000);
    assert_eq!(q.net_amount, 82_000);
}

#[test]
fn route_payroll_transfers_usdc_and_records_batch() {
    let env = Env::default();
    env.ledger().with_mut(|li| li.sequence_number = 50);

    let (client, _, payer, sss, philhealth, pagibig, employees, token) = setup(&env);
    let payroll_id = String::from_str(&env, "PAY-2026-04-01");

    let record = client.route_payroll(&payer, &payroll_id, &100_000);

    assert_eq!(record.gross_amount, 100_000);
    assert_eq!(record.sss_amount, 11_000);
    assert_eq!(record.philhealth_amount, 5_000);
    assert_eq!(record.pagibig_amount, 2_000);
    assert_eq!(record.net_amount, 82_000);
    assert_eq!(record.ledger, 50);

    assert_eq!(token.balance(&payer), 499_900_000);
    assert_eq!(token.balance(&sss), 11_000);
    assert_eq!(token.balance(&philhealth), 5_000);
    assert_eq!(token.balance(&pagibig), 2_000);
    assert_eq!(token.balance(&employees), 82_000);

    assert_eq!(client.get_payroll(&payroll_id), record);
}

#[test]
#[should_panic]
fn cannot_route_same_payroll_twice() {
    let env = Env::default();
    let (client, _, payer, _, _, _, _, _) = setup(&env);
    let payroll_id = String::from_str(&env, "PAY-DUP");

    client.route_payroll(&payer, &payroll_id, &50_000);
    client.route_payroll(&payer, &payroll_id, &50_000);
}

#[test]
fn invalid_bps_on_initialize_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let usdc = env.register_stellar_asset_contract_v2(admin.clone()).address();
    let contract_id = env.register(PayrollSplit, ());
    let client = PayrollSplitClient::new(&env, &contract_id);

    assert_eq!(
        client.try_initialize(
            &admin,
            &usdc,
            &Address::generate(&env),
            &Address::generate(&env),
            &Address::generate(&env),
            &Address::generate(&env),
            &5_000,
            &5_000,
            &5_000,
        ),
        Err(Ok(Error::InvalidBps))
    );
}

#[test]
fn uninitialized_quote_fails() {
    let env = Env::default();
    let contract_id = env.register(PayrollSplit, ());
    let client = PayrollSplitClient::new(&env, &contract_id);

    assert_eq!(client.try_quote(&100_000), Err(Ok(Error::NotInitialized)));
}
