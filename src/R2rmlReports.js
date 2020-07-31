/* eslint-disable class-methods-use-this */
import { LitElement, html, css } from 'lit-element';
import { namedNode } from '@rdf-esm/dataset';
import TermMap from '@rdf-esm/term-map';
import { rdf } from '@tpluscode/rdf-ns-builders';
import reports from './reports.js';
import clownface from './lib/clownface.js';
import { doap, earl } from './lib/ns.js';

export class R2rmlReports extends LitElement {
  static get properties() {
    return {
      reports: { type: Array },
      implementations: { type: Object },
      testCases: { type: Object },
    };
  }

  constructor() {
    super();
    this.implementations = [];
    this.testCases = [];
  }

  static get styles() {
    return css`
      :host {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
        text-align: center;
      }
    `;
  }

  async connectedCallback() {
    super.connectedCallback();

    const pointers = await clownface({
      term: Object.values(reports).map(namedNode),
    }).fetch();

    await import('./elements/r2rml-table.js');

    const anyPointer = clownface({
      _context: pointers.map(p => p._context[0].clone({ value: undefined })),
    });

    this.implementations = this.__reduceImplementations(
      anyPointer.has(rdf.type, doap.Project)
    );
    this.testCases = anyPointer.has(rdf.type, earl.Assertion).toArray();
  }

  __reduceImplementations(implementations) {
    return [
      ...implementations
        .toArray()
        .reduce((map, impl) => {
          map.set(impl.term, impl);
          return map;
        }, new TermMap())
        .values(),
    ].map(impl => implementations.node(impl));
  }

  render() {
    if (!this.implementations.length) {
      return html`Loading reports...`;
    }

    return html`<r2rml-table
      .implementations="${this.implementations}"
      .testCases="${this.testCases}"
    ></r2rml-table>`;
  }
}
