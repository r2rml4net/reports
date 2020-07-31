/* eslint-disable class-methods-use-this */
import { css, LitElement, unsafeCSS } from 'lit-element';
import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat';
import MaterializeCss from 'materialize-css/dist/css/materialize.css';
import { byProperty } from '../lib/sort.js';
import { doap, earl } from '../lib/ns.js';

function termName(pointer) {
  const lastHash = pointer.value.lastIndexOf('#');
  const lastSlash = pointer.value.lastIndexOf('/');

  return pointer.value.substr(lastHash < 0 ? lastSlash : lastHash);
}

export class R2rmlTable extends LitElement {
  static get properties() {
    return {
      implementations: { type: Array },
      testCases: { type: Array },
    };
  }

  static get styles() {
    return [
      css`
        ${unsafeCSS(MaterializeCss)}
      `,
      css`
        thead th {
          position: sticky;
          background-color: white;
          top: 64px;
        }

        td.result {
          background-color: rgb(0 128 0 / 0.5);
          background-opacity: 0.5;
          text-align: center;
        }

        td.result[failures] {
          background-color: rgb(128 0 0 / 0.5);
          background-opacity: 0.5;
        }
      `,
    ];
  }

  get columns() {
    return this.implementations?.map(i => ({
      header: i,
      property: i.value,
    }));
  }

  get testCaseResults() {
    return this.testCases?.sort(byProperty(earl.test));
  }

  render() {
    return html`
      <table>
        <thead>
          <tr>
            <th>↓ Test Case ↓ | Implementation →</th>
            ${repeat(
              this.implementations,
              impl => html`
                <th>
                  <a href="${impl.out(doap.homepage).values[0]}" target="_blank"
                    >${impl.out(doap.name).values[0]}</a
                  >
                </th>
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
