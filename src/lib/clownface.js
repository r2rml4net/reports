import setup from 'clownface-io/factory';
import nodeifyFetch from 'nodeify-fetch';
import fetchLite from '@rdfjs/fetch-lite';
import * as rdf from '@rdf-esm/dataset';
import clownface from '@rdf-esm/clownface';
import * as formats from '@rdf-esm/formats-common';

export default setup({
  fetch: nodeifyFetch,
  rdfFetch: fetchLite,
  factory: rdf,
  clownface,
  formats,
});
