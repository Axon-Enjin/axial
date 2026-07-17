#![cfg(test)]

use super::{ContractorPayroll, ContractorPayrollClient, Error, MAX_PAYEES};
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token::{StellarAssetClient, TokenClient},
    Address, Env, String, Vec,
};

fn setup<'a>(env: &'a Env) -> (ContractorPayrollClient<'a>, Address, Address, TokenClient<'a>) {
    env.mock_all_auths();

    let admin = Address::generate(env);
    let payer = Address::generate(env);
    let usdc_asset = env.register_stellar_asset_contract_v2(admin.clone());
    let usdc_id = usdc_asset.address();
    let sac = StellarAssetClient::new(env, &usdc_id);
    let token = TokenClient::new(env, &usdc_id);

    let contract_id = env.register(ContractorPayroll, ());
    let client = ContractorPayrollClient::new(env, &contract_id);
    client.initialize(&admin, &usdc_id);
    sac.mint(&payer, &1_000_000);

    (client, payer, usdc_id, token)
}

#[test]
fn quote_and_route_batch_pays_contractors() {
    let env = Env::default();
    env.ledger().with_mut(|li| li.sequence_number = 42);
    let (client, payer, _, token) = setup(&env);

    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let mut wallets = Vec::new(&env);
    wallets.push_back(a.clone());
    wallets.push_back(b.clone());
    let mut amounts = Vec::new(&env);
    amounts.push_back(100);
    amounts.push_back(250);

    assert_eq!(client.quote_batch(&wallets, &amounts), 350);

    let batch_id = String::from_str(&env, "BATCH-1");
    let record = client.route_batch(&payer, &batch_id, &wallets, &amounts);

    assert_eq!(record.total_amount, 350);
    assert_eq!(record.payee_count, 2);
    assert_eq!(record.ledger, 42);
    assert_eq!(token.balance(&payer), 999_650);
    assert_eq!(token.balance(&a), 100);
    assert_eq!(token.balance(&b), 250);
    assert_eq!(client.get_batch(&batch_id), record);
}

#[test]
#[should_panic]
fn cannot_route_same_batch_twice() {
    let env = Env::default();
    let (client, payer, _, _) = setup(&env);
    let wallet = Address::generate(&env);
    let mut wallets = Vec::new(&env);
    wallets.push_back(wallet);
    let mut amounts = Vec::new(&env);
    amounts.push_back(10);
    let batch_id = String::from_str(&env, "BATCH-DUP");
    client.route_batch(&payer, &batch_id, &wallets, &amounts);
    client.route_batch(&payer, &batch_id, &wallets, &amounts);
}

#[test]
fn empty_batch_fails() {
    let env = Env::default();
    let (client, _, _, _) = setup(&env);
    let wallets = Vec::new(&env);
    let amounts = Vec::new(&env);
    assert_eq!(
        client.try_quote_batch(&wallets, &amounts),
        Err(Ok(Error::EmptyBatch))
    );
}

#[test]
fn zero_amount_fails() {
    let env = Env::default();
    let (client, _, _, _) = setup(&env);
    let mut wallets = Vec::new(&env);
    wallets.push_back(Address::generate(&env));
    let mut amounts = Vec::new(&env);
    amounts.push_back(0);
    assert_eq!(
        client.try_quote_batch(&wallets, &amounts),
        Err(Ok(Error::InvalidAmount))
    );
}

#[test]
fn length_mismatch_fails() {
    let env = Env::default();
    let (client, _, _, _) = setup(&env);
    let mut wallets = Vec::new(&env);
    wallets.push_back(Address::generate(&env));
    wallets.push_back(Address::generate(&env));
    let mut amounts = Vec::new(&env);
    amounts.push_back(5);
    assert_eq!(
        client.try_quote_batch(&wallets, &amounts),
        Err(Ok(Error::LengthMismatch))
    );
}

#[test]
fn too_many_payees_fails() {
    let env = Env::default();
    let (client, _, _, _) = setup(&env);
    let mut wallets = Vec::new(&env);
    let mut amounts = Vec::new(&env);
    for _ in 0..(MAX_PAYEES + 1) {
        wallets.push_back(Address::generate(&env));
        amounts.push_back(1);
    }
    assert_eq!(
        client.try_quote_batch(&wallets, &amounts),
        Err(Ok(Error::TooManyPayees))
    );
}
