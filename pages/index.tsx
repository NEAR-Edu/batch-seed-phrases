import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
// @ts-ignore
import { generateSeedPhrase } from 'near-seed-phrase'; // https://github.com/near/near-seed-phrase/blob/d0f7671261edba57c6fcb2768994c533a635fc55/index.js
import * as nearAPI from 'near-api-js'; // https://docs.near.org/docs/api/naj-quick-reference#install

function uint8toHex(uint8Array: Uint8Array) {
  // TODO: Confirm that this is correct. Also, why is this not part of the near-seed-phrase library?
  return Buffer.from(uint8Array).toString('hex');
}

function WordByWord({ seedPhrase }: { seedPhrase: string }): JSX.Element {
  const words = seedPhrase.split(' ');
  const wordsWithTooltips = words.map((word: string, index: number) => {
    const tooltip = `${(index + 1).toString()} (Word #)`; // TODO: Use something like https://cedricdelpoux.github.io/react-simple-tooltip/
    return (
      <span key={index} title={tooltip}>
        {word}{' '}
      </span>
    );
  });
  return <>{wordsWithTooltips}</>;
}

function SeedPhrase({ i }: { i: number }): JSX.Element {
  const { seedPhrase, secretKey, publicKey } = generateSeedPhrase();
  const accountId = uint8toHex(nearAPI.utils.PublicKey.fromString(publicKey).data); // https://docs.near.org/docs/roles/integrator/implicit-accounts#converting-a-public-key-to-an-account-id
  return (
    <tr>
      <td>{i}</td>
      <td>{accountId}</td>
      <td>
        <WordByWord seedPhrase={seedPhrase} />
      </td>
    </tr>
  );
}

function SeedPhrases({ num }: { num: number }): JSX.Element {
  const seedPhrases = [];
  for (let i = 1; i <= num; i += 1) {
    seedPhrases.push(i);
  }
  const rows = seedPhrases.map((i, index) => <SeedPhrase key={index} i={i} />);
  return <>{rows}</>;
}

const Home: NextPage = () => {
  // TODO: Fix "Hydration failed because the initial UI does not match what was rendered on the server" https://github.com/vercel/next.js/discussions/35773
  const [numSeedPhrases, setNumSeedPhrases] = useState(5);
  return (
    <div>
      <Head>
        <title>Create multiple NEAR accounts simultaneously</title>
        <meta name="description" content="Create seed phrases for multiple implicit accounts in batches" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <label># of seed phrases:</label>{' '}
        <input type="number" value={numSeedPhrases} onChange={(e) => setNumSeedPhrases(parseInt(e.target.value, 10))} maxLength={2} style={{ width: '3rem' }} />
        <span style={{ color: 'red' }}>(Warning: Editing this number will cause the entire table below to be replaced immediately)</span>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Account Address</th>
              <th>Seed Phrase</th>
            </tr>
          </thead>
          <tbody>
            <SeedPhrases num={numSeedPhrases} />
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Home;
