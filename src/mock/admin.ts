export function renderLeadDocketMockAdminPage(): string {
  return String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lead Docket Mock Server</title>
  <style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #0b1020; color: #e8ecf7; }
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: radial-gradient(circle at top left, #18315d 0, #0b1020 42rem); }
    main { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 40px 0 64px; }
    header { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
    h1, h2, p { margin-top: 0; }
    h1 { margin-bottom: 8px; font-size: clamp(2rem, 5vw, 3.5rem); letter-spacing: -0.05em; }
    h2 { font-size: 1.05rem; letter-spacing: 0.01em; }
    .muted { color: #9eabc8; }
    .header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .status-pill, .docs-link { padding: 8px 12px; border: 1px solid #2d477a; border-radius: 999px; color: #9dd7ff; background: #102344; white-space: nowrap; }
    .docs-link { color: #e3f2ff; font-weight: 750; text-decoration: none; }
    .docs-link:hover { border-color: #55b8ff; }
    .grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr); gap: 20px; }
    .card { border: 1px solid #263557; border-radius: 18px; padding: 20px; background: rgba(13, 22, 42, 0.88); box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2); }
    .stack { display: grid; gap: 16px; }
    .field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    label { display: grid; gap: 7px; color: #b8c3dc; font-size: 0.82rem; font-weight: 650; }
    input, select, textarea { width: 100%; border: 1px solid #34466d; border-radius: 10px; padding: 11px 12px; background: #0a1327; color: #f5f7ff; font: inherit; }
    textarea { min-height: 150px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.82rem; }
    input:focus, select:focus, textarea:focus { outline: 2px solid #55b8ff; outline-offset: 1px; }
    button { border: 0; border-radius: 10px; padding: 11px 14px; background: #58b8ff; color: #06111f; font: inherit; font-weight: 750; cursor: pointer; }
    button:hover { filter: brightness(1.08); }
    button:disabled { opacity: 0.55; cursor: wait; }
    button.secondary { color: #d8e8ff; background: #1a2d50; border: 1px solid #34517f; }
    .presets { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
    .preset { display: grid; text-align: left; gap: 4px; }
    .preset small { color: #a9b8d4; font-weight: 500; }
    .result { min-height: 50px; margin: 0; padding: 12px; border-radius: 10px; background: #091226; color: #aebbd5; white-space: pre-wrap; word-break: break-word; }
    .result.success { color: #8bf0b4; border: 1px solid #245f45; }
    .result.error { color: #ff9caa; border: 1px solid #713342; }
    .list { display: grid; gap: 9px; max-height: 330px; overflow: auto; }
    .list-item { padding: 11px; border-radius: 10px; background: #0a1429; border: 1px solid #233354; }
    .list-item strong { display: block; margin-bottom: 4px; }
    .integration-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; }
    .integration-actions a { color: #8dcbff; font-weight: 700; text-decoration: none; }
    .integration-actions a:hover { text-decoration: underline; }
    .ok { color: #8bf0b4; }
    .failed { color: #ff9caa; }
    code { display: block; overflow-x: auto; padding: 12px; border-radius: 10px; background: #080f20; color: #acd9ff; font-size: 0.78rem; white-space: pre; }
    @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } header { align-items: start; flex-direction: column; } }
    @media (max-width: 560px) { .field-grid, .presets { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <p class="muted">Local development control plane</p>
        <h1>Lead Docket Mock</h1>
        <p class="muted">Trigger realistic webhooks and inspect delivery without touching a live account.</p>
      </div>
      <div class="header-actions">
        <a class="docs-link" href="/">Swagger docs</a>
        <div id="server-status" class="status-pill">Connecting…</div>
      </div>
    </header>

    <div class="grid">
      <section class="stack">
        <form id="generate-data-form" class="card stack">
          <div>
            <h2>Generate mock data</h2>
            <p class="muted">Append deterministic Faker records to the running mock. Reuse a seed to reproduce the same values.</p>
          </div>
          <div class="field-grid">
            <label>Seed<input id="generate-seed" type="number" value="12345" min="0" /></label>
            <label>Contacts<input id="generate-contacts" type="number" value="20" min="0" max="500" /></label>
            <label>Leads<input id="generate-leads" type="number" value="20" min="0" max="500" /></label>
            <label>Opportunities<input id="generate-opportunities" type="number" value="20" min="0" max="500" /></label>
            <label>Tasks<input id="generate-tasks" type="number" value="15" min="0" max="500" /></label>
            <label>Messages<input id="generate-messages" type="number" value="10" min="0" max="500" /></label>
            <label>Users<input id="generate-users" type="number" value="5" min="0" max="500" /></label>
          </div>
          <button id="generate-data-submit" type="submit">Generate and append</button>
          <pre id="generate-data-result" class="result">Current totals will appear here.</pre>
        </form>

        <div class="card stack">
          <div>
            <h2>Webhook destination</h2>
            <p class="muted">Optional. Leave blank to emit only to subscriptions from your config file.</p>
          </div>
          <label>Target URL
            <input id="target-url" type="url" placeholder="http://localhost:3000/webhooks/leaddocket" />
          </label>
        </div>

        <div class="card stack">
          <div>
            <h2>Quick triggers</h2>
            <p class="muted">One click emits a preset payload to the destination above.</p>
          </div>
          <div id="presets" class="presets"></div>
        </div>

        <form id="custom-form" class="card stack">
          <div>
            <h2>Custom webhook</h2>
            <p class="muted">Use any event name and JSON-compatible payload.</p>
          </div>
          <div class="field-grid">
            <label>Event
              <input id="event" value="lead.status_changed" required />
            </label>
            <label>Entity
              <input id="entity" value="lead" required />
            </label>
            <label>Action
              <select id="action">
                <option>created</option><option>updated</option><option>deleted</option>
                <option>completed</option><option>sent</option><option>started</option>
                <option>ended</option><option>locked</option><option>unlocked</option>
                <option>disregarded</option><option>processed</option><option selected>changed</option>
                <option>triggered</option>
              </select>
            </label>
          </div>
          <label>Payload JSON
            <textarea id="payload">{
  "id": 1001,
  "status": "Signed Up"
}</textarea>
          </label>
          <button id="custom-submit" type="submit">Trigger webhook</button>
          <pre id="result" class="result">Ready.</pre>
        </form>
      </section>

      <aside class="stack">
        <div class="card stack">
          <div>
            <h2>Integration forms</h2>
            <p class="muted">Open a configured public intake form and submit a mock opportunity.</p>
          </div>
          <div id="integrations" class="list"></div>
          <label>Import live preview URLs
            <textarea id="integration-urls" placeholder="One /Opportunities/Form/... URL per line"></textarea>
          </label>
          <button id="import-integrations" type="button" class="secondary">Import preview forms</button>
          <pre id="integration-import-result" class="result">URLs are used for read-only preview requests and are not stored in the browser.</pre>
        </div>
        <div class="card stack" id="webhook-examples">
          <div>
            <h2>Webhook payload examples</h2>
            <p class="muted">Sanitized examples matching Lead Docket's flat outbound payloads.</p>
          </div>
          <label>Event
            <select id="webhook-example-select"></select>
          </label>
          <div class="integration-actions">
            <button id="copy-webhook-example" type="button" class="secondary">Copy JSON</button>
            <button id="send-webhook-example" type="button">Send selected example</button>
          </div>
          <pre id="webhook-example-json" class="result">Loading examples…</pre>
        </div>
        <div class="card stack">
          <div>
            <h2>Recent deliveries</h2>
            <p class="muted">HTTP status and failures from this process.</p>
          </div>
          <div id="deliveries" class="list"></div>
        </div>
        <div class="card stack">
          <div>
            <h2>Live setup sync</h2>
            <p class="muted">Sync custom fields and configured integration previews. Credentials stay in ignored local files.</p>
          </div>
          <code>cp .dev.vars.example .dev.vars
# Edit .dev.vars, then run:
leaddocket-mock sync-live</code>
        </div>
      </aside>
    </div>
  </main>

  <script>
    const generateDataForm = document.querySelector('#generate-data-form');
    const generateDataSubmit = document.querySelector('#generate-data-submit');
    const generateDataResult = document.querySelector('#generate-data-result');
    const targetInput = document.querySelector('#target-url');
    const result = document.querySelector('#result');
    const presetsElement = document.querySelector('#presets');
    const deliveriesElement = document.querySelector('#deliveries');
    const integrationsElement = document.querySelector('#integrations');
    const integrationUrls = document.querySelector('#integration-urls');
    const integrationImportButton = document.querySelector('#import-integrations');
    const integrationImportResult = document.querySelector('#integration-import-result');
    const webhookExampleSelect = document.querySelector('#webhook-example-select');
    const webhookExampleJson = document.querySelector('#webhook-example-json');
    const copyWebhookExample = document.querySelector('#copy-webhook-example');
    const sendWebhookExample = document.querySelector('#send-webhook-example');
    const submitButton = document.querySelector('#custom-submit');
    let selectedWebhookPayload;
    let webhookExamplesInitialized = false;

    targetInput.value = localStorage.getItem('lead-docket-mock-target') || '';
    targetInput.addEventListener('change', () => {
      localStorage.setItem('lead-docket-mock-target', targetInput.value.trim());
    });

    function setResult(message, kind) {
      result.textContent = message;
      result.className = 'result' + (kind ? ' ' + kind : '');
    }

    function listItem(title, detail, kind) {
      const item = document.createElement('div');
      item.className = 'list-item';
      const strong = document.createElement('strong');
      strong.textContent = title;
      if (kind) strong.className = kind;
      const small = document.createElement('small');
      small.textContent = detail;
      item.append(strong, small);
      return item;
    }

    async function loadState() {
      const response = await fetch('/__mock/state');
      if (!response.ok) throw new Error('Unable to load mock server state.');
      const state = await response.json();
      document.querySelector('#server-status').textContent = 'Running at ' + state.origin;
      generateDataResult.textContent = 'Current totals: ' + Object.entries(state.storeCounts).map(([name, count]) => name + ' ' + count).join(' · ');

      integrationsElement.replaceChildren();
      if (state.integrations.length === 0) {
        integrationsElement.append(listItem('No forms configured', 'Add opportunityIntegrations to leaddocket.mock.json.'));
      } else {
        for (const integration of state.integrations) {
          const details = (integration.description || 'Opportunity intake form') + ' · ID ' + integration.id + ' · ' + integration.fieldCount + ' fields';
          const item = listItem(integration.name, details);
          const actions = document.createElement('div');
          actions.className = 'integration-actions';
          const openLink = document.createElement('a');
          openLink.href = integration.url;
          openLink.target = '_blank';
          openLink.rel = 'noreferrer';
          openLink.textContent = 'Open form →';
          const previewLink = document.createElement('a');
          previewLink.href = integration.previewUrl;
          previewLink.target = '_blank';
          previewLink.rel = 'noreferrer';
          previewLink.textContent = 'Preview →';
          actions.append(openLink, previewLink);
          item.append(actions);
          integrationsElement.append(item);
        }
      }

      if (!webhookExamplesInitialized) {
        webhookExampleSelect.replaceChildren();
        for (const example of state.webhookExamples) {
          const option = document.createElement('option');
          option.value = example.id;
          option.textContent = example.label;
          webhookExampleSelect.append(option);
        }
        webhookExamplesInitialized = true;
        await loadWebhookExample();
      }

      presetsElement.replaceChildren();
      for (const preset of state.presets) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'secondary preset';
        const title = document.createElement('span');
        title.textContent = preset.label;
        const event = document.createElement('small');
        event.textContent = preset.event;
        button.append(title, event);
        button.addEventListener('click', () => triggerWebhook(preset, button));
        presetsElement.append(button);
      }

      deliveriesElement.replaceChildren();
      const deliveries = state.deliveries.slice(-12).reverse();
      if (deliveries.length === 0) {
        deliveriesElement.append(listItem('No deliveries yet', 'Trigger a webhook to see results.'));
      } else {
        for (const delivery of deliveries) {
          const status = delivery.status ? 'HTTP ' + delivery.status : (delivery.error || delivery.kind);
          deliveriesElement.append(
            listItem(delivery.target, status + ' · ' + delivery.durationMs + 'ms', delivery.ok ? 'ok' : 'failed'),
          );
        }
      }
    }

    async function triggerWebhook(webhook, button) {
      button.disabled = true;
      setResult('Sending…');
      try {
        const response = await fetch('/__mock/webhooks', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...webhook, targetUrl: targetInput.value.trim() || undefined }),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Webhook trigger failed.');
        const failed = body.deliveries.filter((delivery) => !delivery.ok);
        setResult(
          failed.length ? 'Emitted, with delivery failures:\n' + JSON.stringify(failed, null, 2) : 'Emitted ' + body.event.event + '\n' + JSON.stringify(body.deliveries, null, 2),
          failed.length ? 'error' : 'success',
        );
        await loadState();
      } catch (error) {
        setResult(error instanceof Error ? error.message : String(error), 'error');
      } finally {
        button.disabled = false;
      }
    }

    generateDataForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      generateDataSubmit.disabled = true;
      generateDataResult.textContent = 'Generating…';
      const numberValue = (id) => Number(document.querySelector(id).value);
      try {
        const response = await fetch('/__mock/data/generate', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            seed: numberValue('#generate-seed'),
            contacts: numberValue('#generate-contacts'),
            leads: numberValue('#generate-leads'),
            opportunities: numberValue('#generate-opportunities'),
            tasks: numberValue('#generate-tasks'),
            messages: numberValue('#generate-messages'),
            users: numberValue('#generate-users'),
          }),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Data generation failed.');
        generateDataResult.textContent = 'Added: ' + Object.entries(body.added).map(([name, count]) => name + ' ' + count).join(' · ') + '\nTotals: ' + Object.entries(body.totals).map(([name, count]) => name + ' ' + count).join(' · ');
      } catch (error) {
        generateDataResult.textContent = error instanceof Error ? error.message : String(error);
      } finally {
        generateDataSubmit.disabled = false;
      }
    });

    async function loadWebhookExample() {
      const id = webhookExampleSelect.value;
      if (!id) {
        webhookExampleJson.textContent = 'No examples available.';
        return;
      }
      const response = await fetch('/__mock/webhook-examples/' + encodeURIComponent(id));
      if (!response.ok) throw new Error('Unable to load webhook example.');
      const example = await response.json();
      selectedWebhookPayload = example.payload;
      webhookExampleJson.textContent = JSON.stringify(example.payload, null, 2);
    }

    webhookExampleSelect.addEventListener('change', () => {
      loadWebhookExample().catch((error) => {
        webhookExampleJson.textContent = error.message;
      });
    });

    copyWebhookExample.addEventListener('click', async () => {
      if (!selectedWebhookPayload) return;
      await navigator.clipboard.writeText(JSON.stringify(selectedWebhookPayload, null, 2));
      copyWebhookExample.textContent = 'Copied';
      setTimeout(() => { copyWebhookExample.textContent = 'Copy JSON'; }, 1200);
    });

    sendWebhookExample.addEventListener('click', async () => {
      const id = webhookExampleSelect.value;
      if (!id) return;
      sendWebhookExample.disabled = true;
      try {
        const response = await fetch('/__mock/webhook-examples/' + encodeURIComponent(id) + '/trigger', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ targetUrl: targetInput.value.trim() || undefined }),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Example delivery failed.');
        const failed = body.deliveries.filter((delivery) => !delivery.ok);
        webhookExampleJson.textContent = JSON.stringify(selectedWebhookPayload, null, 2) + '\n\n' + (failed.length ? 'Delivery failed: ' + JSON.stringify(failed, null, 2) : 'Example sent successfully.');
        await loadState();
      } catch (error) {
        webhookExampleJson.textContent = error instanceof Error ? error.message : String(error);
      } finally {
        sendWebhookExample.disabled = false;
      }
    });

    integrationImportButton.addEventListener('click', async () => {
      const urls = integrationUrls.value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
      if (urls.length === 0) {
        integrationImportResult.textContent = 'Paste at least one integration preview URL.';
        integrationImportResult.className = 'result error';
        return;
      }
      integrationImportButton.disabled = true;
      integrationImportResult.textContent = 'Importing read-only previews…';
      integrationImportResult.className = 'result';
      try {
        const response = await fetch('/__mock/integrations/import', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ urls }),
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'Integration import failed.');
        integrationUrls.value = '';
        integrationImportResult.textContent = 'Imported ' + body.imported + ' integration forms.';
        integrationImportResult.className = 'result success';
        await loadState();
      } catch (error) {
        integrationImportResult.textContent = error instanceof Error ? error.message : String(error);
        integrationImportResult.className = 'result error';
      } finally {
        integrationImportButton.disabled = false;
      }
    });

    document.querySelector('#custom-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      let data;
      try {
        data = JSON.parse(document.querySelector('#payload').value);
      } catch {
        setResult('Payload must be valid JSON.', 'error');
        return;
      }
      await triggerWebhook(
        {
          event: document.querySelector('#event').value.trim(),
          entity: document.querySelector('#entity').value.trim(),
          action: document.querySelector('#action').value,
          data,
        },
        submitButton,
      );
    });

    loadState().catch((error) => setResult(error.message, 'error'));
    setInterval(() => loadState().catch(() => {}), 4000);
  </script>
</body>
</html>`;
}
