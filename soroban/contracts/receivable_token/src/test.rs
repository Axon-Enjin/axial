#![cfg(test)]

use super::{Error, ReceivableToken, ReceivableTokenClient};
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    Address, Env, String,
};

fn setup<'a>(env: &Env) -> (ReceivableTokenClient<'a>, Address, Address) {
    env.mock_all_auths();

    let admin = Address::generate(env);
    let msme = Address::generate(env);
    let contract_id = env.register(ReceivableToken, ());
    let client = ReceivableTokenClient::new(env, &contract_id);

    client.initialize(&admin);
    (client, admin, msme)
}

#[test]
fn mint_creates_receivable_record() {
    let env = Env::default();
    env.ledger().with_mut(|li| li.sequence_number = 100);

    let (client, admin, msme) = setup(&env);
    let invoice = String::from_str(&env, "INV-2023-8901");

    let record = client.mint(&admin, &msme, &invoice, &250_000);
    assert_eq!(record.msme, msme);
    assert_eq!(record.face_amount, 250_000);
    assert_eq!(record.minted_ledger, 100);

    assert!(client.is_minted(&invoice));
    assert_eq!(client.get_receivable(&invoice), record);
}

#[test]
#[should_panic]
fn cannot_mint_same_invoice_twice() {
    let env = Env::default();
    let (client, admin, msme) = setup(&env);
    let invoice = String::from_str(&env, "INV-DUP");

    client.mint(&admin, &msme, &invoice, &100_000);
    client.mint(&admin, &msme, &invoice, &100_000);
}

#[test]
fn non_issuer_cannot_mint() {
    let env = Env::default();
    let (client, _admin, msme) = setup(&env);
    let stranger = Address::generate(&env);
    let invoice = String::from_str(&env, "INV-UNAUTH");

    assert_eq!(
        client.try_mint(&stranger, &msme, &invoice, &50_000),
        Err(Ok(Error::Unauthorized))
    );
}

#[test]
fn uninitialized_get_fails() {
    let env = Env::default();
    let contract_id = env.register(ReceivableToken, ());
    let client = ReceivableTokenClient::new(&env, &contract_id);
    let invoice = String::from_str(&env, "INV-X");

    assert_eq!(
        client.try_get_receivable(&invoice),
        Err(Ok(Error::NotInitialized))
    );
}
