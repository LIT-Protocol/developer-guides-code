#![no_std]
use soroban_sdk::{contract, contracterror, contractimpl, panic_with_error, Address, Env, Vec, String};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInit = 1,
    NotAuthed = 2,
}

#[contract]
pub struct AllowListContract;

#[contractimpl]
impl AllowListContract {
    // Initialize the contract with the admin's address in the allow list
    pub fn init(env: Env, admin: Address) {
        let admin_key = String::from_str(&env, "admin");
        if env.storage().persistent().get::<_, Address>(&admin_key).is_some() {
            panic_with_error!(&env, Error::AlreadyInit);
        }

        // Set the admin address separately for future auth verification
        env.storage().persistent().set(&admin_key, &admin);

        // Initialize the allow list and add the admin's address to it
        let allow_list_key = String::from_str(&env, "allow_list");
        let mut allow_list = Vec::<Address>::new(&env);
        allow_list.push_back(admin);
        env.storage().persistent().set(&allow_list_key, &allow_list);
    }

    // Add a new address to the allow list
    pub fn allow(env: Env, address: Address) {
        let admin_key = String::from_str(&env, "admin");
        let stored_admin: Address = env.storage().persistent().get(&admin_key).unwrap();
        stored_admin.require_auth();

        let allow_list_key = String::from_str(&env, "allow_list");
        let mut allow_list: Vec<Address> = env.storage().persistent().get(&allow_list_key).unwrap_or(Vec::new(&env));
        allow_list.push_back(address);
        env.storage().persistent().set(&allow_list_key, &allow_list);
    }

    // Check if the address is on the allow list
    pub fn is_allowed(env: Env, address: Address) -> bool {
        let allow_list_key = String::from_str(&env, "allow_list");
        let allow_list: Vec<Address> = env.storage().persistent().get(&allow_list_key).unwrap_or(Vec::new(&env));
        allow_list.iter().any(|addr| addr == address)
    }

    // Verify if the address calling this method is authorized and on the allow list
    pub fn is_authed(env: Env, address: Address) -> bool {
        address.require_auth();
        Self::is_allowed(env, address)
    }
}
