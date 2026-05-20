#![cfg(test)]

use super::{AxialSwap, AxialSwapClient, Error};
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token::{StellarAssetClient, TokenClient},
    Address, Env, String,
};

const ADVANCE_BPS: u32 = 8_500;

fn setup<'a>(
    env: &Env,
) -> (
    AxialSwapClient<'a>,
    Address,
    Address,
    Address,
    Address,
    TokenClient<'a>,
) {
    env.mock_all_auths();

    let admin = Address::generate(env);
    let funder = Address::generate(env);
    let msme = Address::generate(env);

    let usdc_asset = env.register_stellar_asset_contract_v2(admin.clone());
    let usdc_id = usdc_asset.address();
    let sac = StellarAssetClient::new(env, &usdc_id);
    let token = TokenClient::new(env, &usdc_id);

    let contract_id = env.register(AxialSwap, ());
    let client = AxialSwapClient::new(env, &contract_id);

    client.initialize(&admin, &usdc_id, &ADVANCE_BPS);
    sac.mint(&funder, &1_000_000_000);

    (client, admin, funder, msme, usdc_id, token)
}

#[test]
fn quote_splits_face_at_advance_bps() {
    let env = Env::default();
    let (client, _, _, _, _, _) = setup(&env);

    let (advance, reserve) = client.quote(&100_000);
    assert_eq!(advance, 85_000);
    assert_eq!(reserve, 15_000);
}

#[test]
fn execute_advance_transfers_usdc_and_records_swap() {
    let env = Env::default();
    env.ledger().with_mut(|li| li.sequence_number = 42);

    let (client, _, funder, msme, _, token) = setup(&env);
    let invoice = String::from_str(&env, "INV-2023-8901");

    let record = client.execute_advance(&funder, &msme, &invoice, &100_000);

    assert_eq!(record.advance_amount, 85_000);
    assert_eq!(record.reserve_amount, 15_000);
    assert_eq!(record.ledger, 42);
    assert_eq!(token.balance(&funder), 999_915_000);
    assert_eq!(token.balance(&msme), 85_000);

    let stored = client.get_swap(&invoice);
    assert_eq!(stored, record);
}

#[test]
#[should_panic]
fn cannot_swap_same_invoice_twice() {
    let env = Env::default();
    let (client, _, funder, msme, _, _) = setup(&env);
    let invoice = String::from_str(&env, "INV-DUP");

    client.execute_advance(&funder, &msme, &invoice, &50_000);
    client.execute_advance(&funder, &msme, &invoice, &50_000);
}

#[test]
fn uninitialized_quote_fails() {
    let env = Env::default();
    let contract_id = env.register(AxialSwap, ());
    let client = AxialSwapClient::new(&env, &contract_id);
    assert_eq!(client.try_quote(&100), Err(Ok(Error::NotInitialized)));
}
