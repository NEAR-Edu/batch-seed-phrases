import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
// @ts-ignore
import { generateSeedPhrase } from 'near-seed-phrase'; // https://github.com/near/near-seed-phrase/blob/d0f7671261edba57c6fcb2768994c533a635fc55/index.js
import * as nearAPI from 'near-api-js'; // https://docs.near.org/docs/api/naj-quick-reference#install
import 'bootstrap/dist/css/bootstrap.css';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

type SeedPhraseObject = any;
type PageProps = { seedPhraseObjects: SeedPhraseObject[] };

const queryParamKey = 'n'; // E.g. use ?n=50 in the URL
const defaultNumSeedPhrases = 20;

function uint8toHex(uint8Array: Uint8Array) {
  // TODO: Confirm that this is correct. Also, why is this not part of the near-seed-phrase library and the near-api-js library?
  return Buffer.from(uint8Array).toString('hex');
}

function getAccountId(publicKey: string): string {
  // TODO: Confirm that this is correct. Also, why is this not part of the near-seed-phrase library and the near-api-js library?
  return uint8toHex(nearAPI.utils.PublicKey.fromString(publicKey).data); // https://docs.near.org/docs/roles/integrator/implicit-accounts#converting-a-public-key-to-an-account-id
}

function wordWithTooltip(word: string, index: number): JSX.Element {
  function renderTooltip(props: any) {
    return (
      <Tooltip {...props}>
        <div>Word #</div>
        <div>{(index + 1).toString()}</div>
      </Tooltip>
    );
  }

  return (
    <span key={index}>
      <OverlayTrigger key={index} placement="top" overlay={renderTooltip}>
        <span className="word">{word}</span>
      </OverlayTrigger>{' '}
      {/* The space is important so that the words are separate when copying and pasting. */}
    </span>
  );
}

function WordByWord({ seedPhrase }: { seedPhrase: string }): JSX.Element {
  const words = seedPhrase.split(' ');
  const wordsWithTooltips = words.map((word: string, index: number) => {
    return wordWithTooltip(word, index);
  });
  return <>{wordsWithTooltips}</>;
}

function SeedPhrase({ seedPhraseObject }: { seedPhraseObject: SeedPhraseObject }): JSX.Element {
  const { i, seedPhrase, accountId } = seedPhraseObject;
  return (
    <tr>
      <td>{i}</td>
      <td>{accountId}</td>
      <td>
        <WordByWord seedPhrase={seedPhrase} />
      </td>
      <td className="clip">{JSON.stringify(seedPhraseObject)}</td>
    </tr>
  );
}

function generateSeedPhrases(num: number): SeedPhraseObject[] {
  const seedPhraseObjects = [];
  for (let i = 1; i <= num; i += 1) {
    const { seedPhrase, secretKey, publicKey } = generateSeedPhrase();
    console.log({ seedPhrase });
    const accountId = getAccountId(publicKey);
    const seedPhraseObject = { i, seedPhrase, secretKey, publicKey, accountId };
    console.log({ seedPhraseObject });
    seedPhraseObjects.push(seedPhraseObject);
  }
  return seedPhraseObjects;
}

function SeedPhraseRows({ seedPhraseObjects }: { seedPhraseObjects: SeedPhraseObject[] }): JSX.Element {
  const rows = seedPhraseObjects.map((seedPhraseObject: SeedPhraseObject, index: number) => <SeedPhrase key={index} seedPhraseObject={seedPhraseObject} />);
  return <>{rows}</>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const numSeedPhrases = Number(context.query[queryParamKey]) || defaultNumSeedPhrases;
  const seedPhraseObjects = generateSeedPhrases(numSeedPhrases);
  console.log({ numSeedPhrases, seedPhraseObjects });
  return {
    props: { seedPhraseObjects }, // will be passed to the page component as props
  };
};

const Home: NextPage<PageProps> = ({ seedPhraseObjects }: PageProps) => {
  return (
    <div>
      <Head>
        <title>Create multiple NEAR accounts simultaneously</title>
        <meta name="description" content="Create seed phrases for multiple implicit accounts in batches" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Account Address</th>
              <th>Seed Phrase</th>
              <th>JSON</th>
            </tr>
          </thead>
          <tbody>
            <SeedPhraseRows seedPhraseObjects={seedPhraseObjects} />
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Home;
