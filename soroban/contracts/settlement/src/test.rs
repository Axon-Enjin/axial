#![cfg(test)]

use super::{Error, LockboxStatus, Settlement, SettlementClient};
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token::{StellarAssetClient, TokenClient},
    Address, Env, String,
};

fn setup<'a>(
    env: &Env,
) -> (
    SettlementClient<'a>,
    Address,  // admin
    Address,  // funder
    Address,  // msme
    Address,  // payer
    Address,  // usdc contract
    TokenClient<'a>,
) {
    env.mock_all_auths();

    let admin = Address::generate(env);
    let funder = Address::generate(env);
    let msme = Address::generate(env);
    let payer = Address::generate(env);

    let usdc_asset = env.register_stellar_asset_contract_v2(admin.clone());
    let usdc_id = usdc_asset.address();
    let sac = StellarAssetClient::new(env, &usdc_id);
    let token = TokenClient::new(env, &usdc_id);

    let contract_id = env.register(Settlement, ());
    let client = SettlementClient::new(env, &contract_id);

    client.initialize(&admin, &usdc_id);

    // Fund payer so they can pay into the lockbox
    sac.mint(&payer, &1_000_000_000);

    (client, admin, funder, msme, payer, usdc_id, token)
}

fn register_invoice<'a>(
    client: &SettlementClient<'a>,
    env: &Env,
    admin: &Address,
    funder: &Address,
    msme: &Address,
    invoice_id: &str,
) {
    let id = String::from_str(env, invoice_id);
    client.register_invoice(admin, &id, funder, msme, &100_000, &85_000);
}

#[test]
fn register_records_lockbox_state() {
    let env = Env::default();
    let (client, admin, funder, msme, _, _, _) = setup(&env);
    let id = String::from_str(&env, "INV-001");

    let record = client.register_invoice(&admin, &id, &funder, &msme, &100_000, &85_000);

    assert_eq!(record.face_amount, 100_000);
    assert_eq!(record.advance_amount, 85_000);
    assert_eq!(record.reserve_amount, 15_000);
    assert_eq!(record.status, LockboxStatus::Open);
    assert_eq!(record.collected_amount, 0);
    assert_eq!(record.shortfall, 0);
}

#[test]
fn settle_full_payment_distributes_correctly() {
    let env = Env::default();
    env.ledger().with_mut(|li| li.sequence_number = 100);
    let (client, admin, funder, msme, payer, usdc_id, token) = setup(&env);

    register_invoice(&client, &env, &admin, &funder, &msme, "INV-002");

    // Simulate payer sending face_amount (100_000) to the settlement contract
    let contract_addr = client.address.clone();
    token.mock_all_auths().transfer(&payer, &contract_addr, &100_000);

    let record = client.settle(&admin, &String::from_str(&env, "INV-002"), &100_000);

    assert_eq!(record.status, LockboxStatus::Settled);
    assert_eq!(record.collected_amount, 100_000);
    assert_eq!(record.shortfall, 0);
    assert_eq!(record.settled_ledger, 100);

    // Funder repaid advance (85_000), MSME gets reserve (15_000)
    assert_eq!(token.balance(&funder), 85_000);
    assert_eq!(token.balance(&msme), 15_000);
    assert_eq!(token.balance(&contract_addr), 0);
}

#[test]
fn settle_partial_payment_records_shortfall() {
    let env = Env::default();
    let (client, admin, funder, msme, payer, usdc_id, token) = setup(&env);

    register_invoice(&client, &env, &admin, &funder, &msme, "INV-003");

    let contract_addr = client.address.clone();
    // Payer only sends 60_000 (partial — shortfall of 25_000 on the advance)
    token.mock_all_auths().transfer(&payer, &contract_addr, &60_000);

    let record = client.settle(&admin, &String::from_str(&env, "INV-003"), &60_000);

    assert_eq!(record.status, LockboxStatus::Leaked);
    assert_eq!(record.collected_amount, 60_000);
    assert_eq!(record.shortfall, 25_000); // 85_000 advance - 60_000 collected
    // Funder gets 60_000 (all collected), MSME gets 0
    assert_eq!(token.balance(&funder), 60_000);
    assert_eq!(token.balance(&msme), 0);
}

#[test]
fn report_leakage_transitions_to_leaked() {
    let env = Env::default();
    let (client, admin, funder, msme, _, _, _) = setup(&env);

    register_invoice(&client, &env, &admin, &funder, &msme, "INV-004");
    let record = client.report_leakage(&admin, &String::from_str(&env, "INV-004"));

    assert_eq!(record.status, LockboxStatus::Leaked);
    assert_eq!(record.shortfall, 85_000); // full advance at risk
}

#[test]
#[should_panic]
fn cannot_register_same_invoice_twice() {
    let env = Env::default();
    let (client, admin, funder, msme, _, _, _) = setup(&env);

    register_invoice(&client, &env, &admin, &funder, &msme, "INV-DUP");
    register_invoice(&client, &env, &admin, &funder, &msme, "INV-DUP");
}

#[test]
#[should_panic]
fn cannot_settle_already_settled_invoice() {
    let env = Env::default();
    let (client, admin, funder, msme, payer, usdc_id, token) = setup(&env);

    register_invoice(&client, &env, &admin, &funder, &msme, "INV-005");

    let contract_addr = client.address.clone();
    token.mock_all_auths().transfer(&payer, &contract_addr, &100_000);

    client.settle(&admin, &String::from_str(&env, "INV-005"), &100_000);
    // Second settle should panic
    client.settle(&admin, &String::from_str(&env, "INV-005"), &100_000);
}

#[test]
fn uninitialized_register_fails() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let funder = Address::generate(&env);
    let msme = Address::generate(&env);
    let contract_id = env.register(Settlement, ());
    let client = SettlementClient::new(&env, &contract_id);
    let id = String::from_str(&env, "INV-UNINIT");
    assert_eq!(
        client.try_register_invoice(&admin, &id, &funder, &msme, &100_000, &85_000),
        Err(Ok(Error::NotInitialized))
    );
}
