#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct IsMagicNumberContract;

#[contractimpl]
impl IsMagicNumberContract {
    pub fn is_magic_number(_env: Env, number: u32) -> bool {
        number == 42
    }

    pub fn always_true(_env: Env) -> bool {
        true
    }
}

mod test;
