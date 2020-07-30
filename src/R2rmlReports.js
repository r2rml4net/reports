/* eslint-disable class-methods-use-this */
import { LitElement, html, css } from 'lit-element';
import { namedNode } from '@rdf-esm/dataset';
import TermMap from '@rdf-esm/term-map';
import { rdf } from '@tpluscode/rdf-ns-builders';
import { repeat } from 'lit-html/directives/repeat';
import reports from './reports.js';
import clownface from './lib/clownface.js';
import { doap, earl } from './lib/ns.js';

function termName(pointer) {
  const lastHash = pointer.value.lastIndexOf('#');
  const lastSlash = pointer.value.lastIndexOf('/');

  return pointer.value.substr(lastHash < 0 ? lastSlash : lastHash);
}

function byProperty(prop) {
  return (left, right) =>
    left.out(prop).value.localeCompare(right.out(prop).value);
}

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

      td.result {
        background-color: rgb(0 128 0 / 0.5);
        background-opacity: 0.5;
      }

      td.result[failures] {
        background-color: rgb(128 0 0 / 0.5);
        background-opacity: 0.5;
      }
    `;
  }

  async connectedCallback() {
    super.connectedCallback();

    const pointers = await clownface({
      term: Object.values(reports).map(namedNode),
    }).fetch();
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
    return html`
      <table>
        <thead>
          <tr>
            <td></td>
            ${repeat(
              this.implementations,
              impl => html`
                <td>
                  <a href="${impl.out(doap.homepage).values[0]}" target="_blank"
                    >${impl.out(doap.name).values[0]}</a
                  >
                </td>
              `
            )}
          </tr>
        </thead>
        <tbody>
          ${repeat(
            this.testCases.sort(byProperty(earl.test)),
            tc => html`
              <tr>
                <td>
                  <a href="${tc.out(earl.test).value}" target="_blank"
                    >${termName(tc.out(earl.test))}</a
                  >
                </td>
                ${repeat(
                  this.implementations,
                  this.__renderResultCell(tc.out(earl.test))
                )}
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }

  __renderResultCell(test) {
    return impl => {
      const assertions = impl
        .in(earl.subject)
        .has(earl.test, test)
        .out(earl.result)
        .toArray();

      const total = assertions.reduce(
        ({ failed, passed }, result) => {
          if (earl.pass.equals(result.out(earl.outcome).term)) {
            return { failed, passed: passed + 1 };
          }

          return { passed, failed: failed + 1 };
        },
        {
          failed: 0,
          passed: 0,
        }
      );

      return html`<td class="result" ?failures="${total.failed > 0}">
        ${total.passed}/${total.failed + total.passed}
      </td>`;
    };
  }
}
