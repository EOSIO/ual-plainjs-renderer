export default {
  actions: [{
    account: "eosio.token",
    name: "transfer",
    authorization: [{
      actor: "", // use account that was logged in
      permission: "active",
    }],
    data: {
      from: "", // use account that was logged in
      to: "cryptkeeper",
      quantity: "1.0000 EOS",
      memo: "UAL works!",
    },
  }],
}
