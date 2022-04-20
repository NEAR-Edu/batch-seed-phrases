import * as nearAPI from 'near-api-js'; // https://docs.near.org/docs/api/naj-quick-reference#install

// TODO: Confirm that these functions are correct. Also, why are they not part of the near-seed-phrase library and the near-api-js library?

function arrayBufferToHex(arrayBuffer: Uint8Array) {
  // https://stackoverflow.com/a/55200387/
  return Array.prototype.map.call(new Uint8Array(arrayBuffer), (n) => n.toString(16).padStart(2, '0')).join('');
}

export function getAccountId(publicKey: string): string {
  const publicKeyArrayBuffer = nearAPI.utils.PublicKey.fromString(publicKey).data; // https://docs.near.org/docs/roles/integrator/implicit-accounts#converting-a-public-key-to-an-account-id
  return arrayBufferToHex(publicKeyArrayBuffer);
}
