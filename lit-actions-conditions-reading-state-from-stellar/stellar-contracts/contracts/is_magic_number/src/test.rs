#![cfg(test)]

use super::*;
use soroban_sdk::{Env};

#[test]
fn test_is_magic_number_true() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IsMagicNumberContract);
    let client = IsMagicNumberContractClient::new(&env, &contract_id);

    // Test that is_magic_number returns true when passed 42
    let result = client.is_magic_number(&42);
    assert!(result, "is_magic_number should return true for 42.");
}

#[test]
fn test_is_magic_number_false() {
    let env = Env::default();
    let contract_id = env.register_contract(None, IsMagicNumberContract);
    let client = IsMagicNumberContractClient::new(&env, &contract_id);

    // Test that is_magic_number returns false when passed a number other than 42
    let result = client.is_magic_number(&41);
    assert!(!result, "is_magic_number should return false for numbers other than 42.");
}
