extern crate cfg_if;
extern crate wasm_bindgen;

mod utils;
mod fasthash;

use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;
use crate::fasthash::fasthash;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
pub fn greet() -> String {
    format!("{}", fasthash("asdaglkjaslkgjas", 4))
}
