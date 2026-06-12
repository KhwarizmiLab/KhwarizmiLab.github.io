---
title: "Zombie Cards Back Online"
layout: textlay
excerpt: "Zombie Cards: Reviving Expired Credit Cards for Contactless Payments"
sitemap: true
permalink: /emvexpiredcards/
---

<!-- IMAGES: add the following to images/emv/
  setup.jpg, cardemulator.jpg, posemulator.jpg, receipt.jpg -->

<!-- ─────────────────── HERO ─────────────────── -->
<div class="text-center">
  <h1>Zombie Cards Back Online</h1>
  <h4>Reviving Expired Credit Cards for Contactless Payments</h4>
  <p>
    <a href="{{ site.url }}{{ site.baseurl }}/team">Raja Hasnain Anwar</a> &nbsp;·&nbsp;
    Gerard DeCunha &nbsp;·&nbsp;
    <a href="https://people.cs.umass.edu/~taqi/" target="_blank">Muhammad Taqi Raza</a>
  </p>
  <p class="text-muted">University of Massachusetts Amherst</p>
  <p>
    <span class="label label-default">USENIX Security 2026</span>
    &nbsp;
    <span class="label label-success">Artifact Evaluated &mdash; Available</span>
  </p>
</div>

---

## Abstract

<div class="well well-sm">
Contactless payment cards are widely assumed to stop working past their printed expiration dates,
and many stakeholders rely on this assumption for authorization and access control.
This paper shows that banks enforce the expiration as a <em>transaction policy check</em>, rather than an
intrinsic property of the card, which allows an expired card to still initiate contactless payments.
We demonstrate a practical <strong>"Zombie Card" attack</strong> that makes an expired card appear unexpired,
allowing successful transactions despite the card being past its printed date.
We evaluate the attack across real-world transaction configurations spanning multiple EMV kernels
(Visa, Mastercard, and Discover), POS terminals, merchants, and five major US banks.
Our results show that Visa contactless transactions are susceptible to man-in-the-middle tampering
due to a lack of effective integrity protection. We further find that banks often rely on the POS
terminal's decisions and skip critical security checks during transaction authorization for faster
payments. Across our trials, the attack remains operational under typical in-store conditions using
commodity NFC transceivers and does not require specialized hardware. Together, these findings
indicate that the outcome of a "zombie card" transaction is determined by how security responsibility
is divided between terminals, card manufacturers, and issuers, and by how consistently issuers
enforce card lifecycle state. Based on these findings, we propose countermeasures that span kernels,
issuers, and payments to ensure end-to-end transaction integrity and security.
</div>


## Demo Video

<!-- Replace VIDEO_ID with the actual YouTube video ID -->
<div class="embed-responsive embed-responsive-16by9">
  <iframe class="embed-responsive-item"
          src="https://www.youtube.com/embed/VIDEO_ID"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
</div>
<p class="text-center"><small>A live demonstration of the Zombie Card attack: an expired Visa card completing a $100 contactless transaction at a real POS terminal.</small></p>

## Background: How EMV Contactless Payments Work

<p>
EMV (Europay, Mastercard, Visa) is the global standard governing chip-based card payments.
In a <strong>contactless transaction</strong>, the card and a Point-of-Sale (POS) terminal exchange
Application Protocol Data Units (APDUs) over NFC. Five parties participate:
</p>

<div class="row">
  <div class="col-sm-6">
    <ul>
      <li><strong>Card (Payment Device)</strong> — stores the payment application and cryptographic keys in a secure element.</li>
      <li><strong>POS Terminal</strong> — reads the card over NFC, applies kernel rules, and decides whether to approve locally or escalate online.</li>
      <li><strong>Acquirer</strong> — the merchant's bank; routes the transaction to the payment network.</li>
    </ul>
  </div>
  <div class="col-sm-6">
    <ul>
      <li><strong>Payment Network</strong> (Visa, Mastercard, Discover) — defines the kernel specification and routes between acquirer and issuer.</li>
      <li><strong>Issuer</strong> — the cardholder's bank; ultimately authorizes or declines based on its own risk engine.</li>
    </ul>
  </div>
</div>

<p>
Each payment network defines a <strong>kernel</strong> — the protocol logic the terminal executes.
Kernels differ in which fields they authenticate and how they handle edge cases.
This paper focuses on <strong>Kernel 3 (Visa payWave)</strong> and compares it against Kernel 2 (Mastercard),
Kernel 4 (AmEx), and Kernel 6 (Discover).
</p>

<blockquote>
<strong>The Expiry Duality:</strong> Card expiration appears in <em>two separate fields</em>.
The <strong>Application Expiration Date</strong> (<code>#5F24</code>) is read by the terminal for its local check.
The expiry embedded in <strong>Track 2 Equivalent Data</strong> (<code>#57</code>) is forwarded to the issuer in the
online authorization request. These two representations are consumed independently — and Kernel 3
does <em>not</em> require them to be consistently bound end-to-end.
</blockquote>

## The Zombie Card Attack

<p>
The key insight is that in Visa Kernel 3, the terminal's expiry check is a <strong>local policy decision</strong>,
not a cryptographic proof from the card. The Application Expiration Date (<code>#5F24</code>) is transmitted
in plaintext over NFC and is <em>excluded from the card's RSA signature</em> (SDAD). An attacker with an
NFC man-in-the-middle position can rewrite this field without invalidating any cryptographic check
the terminal performs.
</p>

<div class="panel panel-default">
  <div class="panel-heading"><strong>Attack Flow</strong></div>
  <ul class="list-group">
    <li class="list-group-item"><strong>Step 1 — Relay Setup.</strong>
    The attacker places a <em>CardEmulator</em> phone near the POS terminal and a <em>POSEmulator</em> phone
    near the expired card. The two phones relay APDUs over Wi-Fi, creating a transparent NFC
    man-in-the-middle using commodity Android devices — no specialized hardware required.</li>
    <li class="list-group-item"><strong>Step 2 — Payload Injection.</strong>
    During the terminal's <code>READ RECORD</code> phase, the card returns its Application Expiration Date
    and Track 2 data in plaintext. The relay intercepts the response and rewrites
    <code>#5F24</code> from the expired date <em>D<sub>expired</sub></em> to a future date
    <em>D<sub>future</sub> &gt; D<sub>transaction</sub></em>.
    Track 2 (<code>#57</code>) is left untouched — it carries the expired date toward the issuer.</li>
    <li class="list-group-item"><strong>Step 3 — Integrity Checks Bypassed.</strong>
    Kernel 3 <strong>excludes <code>#5F24</code> from SDAD</strong>, so the RSA signature over the card's
    dynamic data remains valid. The terminal never learns the real expiry was manipulated.
    Additionally, Kernel 3 forwards a TVR of <em>all zeros</em> to the issuer, stripping out any
    flag the terminal might have set for "Expired Application."</li>
    <li class="list-group-item"><strong>Step 4 — Certificate Validity Holds.</strong>
    Per EMV spec, certificate lifetimes may extend beyond the card's printed expiry.
    The expired card's PKI certificates are still valid, so Offline Data Authentication (fDDA)
    succeeds normally.</li>
    <li class="list-group-item"><strong>Step 5 — Issuer Authorization.</strong>
    The card computes a valid ARQC using its still-valid issuer master keys. The issuer
    receives a valid cryptogram, an active PAN, and a zeroed TVR — indistinguishable from a
    legitimate transaction. Issuers that check only whether the account is open (not whether
    the specific card instrument is still valid) approve the transaction.</li>
  </ul>
</div>

## Experimental Setup

<p>
We implemented a standard NFC relay on two OnePlus Nord 5 Android phones running a custom
app in two roles: <strong>CardEmulator</strong> (near the POS terminal) and <strong>POSEmulator</strong>
(near the expired card). Cards from Visa, Mastercard, Discover, and AmEx issued by five major US
banks were tested, alongside Apple Pay and Google Pay wallets. POS terminals used were SumUp Plus
and SumUp Solo readers, with additional in-the-wild validation at campus retail and grocery merchants.
Each APDU round-trip added 20–50 ms of relay overhead — well within the 500 ms EMV response window.
</p>

<div class="row">
  <div class="col-sm-12">
    <img src="{{ site.url }}{{ site.baseurl }}/images/emv/setup.jpg"
         alt="Experimental setup: SumUp terminals, CardEmulator phone, POSEmulator phone, and victim card"
         class="img-responsive center-block" />
    <p class="text-center"><small>Experimental setup. (1) SumUp Plus terminal, (2) companion merchant app, (3) SumUp Solo terminal,
      (4) CardEmulator phone presenting card data to the terminal, (5) victim expired card,
      (6) POSEmulator phone reading and relaying card APDUs.</small></p>
  </div>
</div>

<div class="row">
  <div class="col-sm-6">
    <img src="{{ site.url }}{{ site.baseurl }}/images/emv/cardemulator.jpg"
         alt="CardEmulator app showing relayed APDU commands and responses"
         class="img-responsive" />
    <p class="text-center"><small>CardEmulator — relayed APDU commands and responses at the terminal side.</small></p>
  </div>
  <div class="col-sm-6">
    <img src="{{ site.url }}{{ site.baseurl }}/images/emv/posemulator.jpg"
         alt="POSEmulator app showing card APDU reads"
         class="img-responsive" />
    <p class="text-center"><small>POSEmulator — APDU reads from the victim expired card.</small></p>
  </div>
</div>

<div class="row">
  <div class="col-sm-6 col-sm-offset-3">
    <img src="{{ site.url }}{{ site.baseurl }}/images/emv/receipt.jpg"
         alt="Receipt showing $100 approved transaction on an expired Visa card"
         class="img-responsive center-block" />
    <p class="text-center"><small>Transaction receipt for a $100 contactless payment approved on an expired Visa card ending in 8634.</small></p>
  </div>
</div>

## Key Findings

<div class="panel panel-default">
  <div class="panel-body"><strong>F1 — Kernel 3 enables expired card revival.</strong><br>
  An unmodified expired Visa card is rejected as expected. After in-flight rewriting of
  <code>#5F24</code>, the same card completes transactions across $1, $100, and $500 amounts, at
  controlled POS terminals and at real retail and grocery merchants. No special merchant setup or
  amount threshold is required.</div>
</div>

<div class="panel panel-default">
  <div class="panel-body"><strong>F2 — Kernel design determines whether expiry is integrity-protected.</strong><br>
  Kernels 2 (Mastercard), 4 (AmEx), and 6 (Discover) cryptographically bind expiry-relevant data
  to authenticated protocol outputs. Any in-flight modification triggers a signature mismatch and
  transaction decline. Kernel 3 (Visa) does not, creating the exploitable gap.</div>
</div>

<div class="panel panel-default">
  <div class="panel-body"><strong>F3 — Issuer authorization behavior is inconsistent.</strong><br>
  Among the tested banks, Bank A approved all transactions from the expired card once the terminal
  accepted the modified expiry — its authorization logic checks only that the account is open and
  the ARQC is valid. Bank B consistently declined and prompted the cardholder to use the
  replacement card, indicating instrument-level lifecycle enforcement.</div>
</div>

<div class="panel panel-default">
  <div class="panel-body"><strong>F4 — Card replacement does not guarantee revocation.</strong><br>
  A card replaced by the issuer (before its printed expiry) continued to complete transactions to
  the same underlying account. "Replaced" is an issuer-managed state not reflected in on-card
  fields evaluated by the kernel, and EMV does not mandate uniform handling of this lifecycle event.</div>
</div>

<div class="panel panel-default">
  <div class="panel-body"><strong>F5 — Digital wallets are more resilient.</strong><br>
  Apple Pay and Google Pay tokens are updated over-the-air by the issuer's token service provider.
  Token expiry is refreshed without cardholder action, reducing the probability that an expired
  underlying credential remains usable. This reflects the core lesson: centralized lifecycle
  management is more robust than terminal-local policy checks.</div>
</div>

## Proposed Countermeasures

<dl class="dl-horizontal">
  <dt>CM0</dt><dd>Cardholders should physically destroy expired cards (cut through chip and stripe). Issuers and terminal vendors should deploy the EMV Relay Resistance Protocol (RRP).</dd>
  <dt>CM1</dt><dd>Cryptographically bind the Application Expiration Date to an issuer-verifiable signature or ODA data, so NFC-layer tampering is detectable.</dd>
  <dt>CM2</dt><dd>Terminals should enforce consistency between <code>#5F24</code> and the expiry embedded in Track 2 at the earliest verifiable point and generate issuer-visible evidence on divergence.</dd>
  <dt>CM3</dt><dd>Issuers should authorize against a (PAN, expiration date) tuple — not PAN alone — so an obsolete card cannot ride on an active account.</dd>
  <dt>CM4</dt><dd>When a replacement card is issued, the prior card should transition to a hard revocation state that declines across all amounts and merchant categories.</dd>
  <dt>CM5</dt><dd>Kernels should forward the actual TVR to the issuer. Sending all-zeros removes the standard channel for issuer-side compensating controls.</dd>
  <dt>CM6</dt><dd>When authenticated static data is inconsistent, terminals should fail closed rather than continuing via online fallback.</dd>
</dl>

## Paper &amp; Resources

<p>
  <a class="btn btn-default" href="#">Paper (PDF)</a>
  <a class="btn btn-default" href="https://doi.org/10.5281/zenodo.20437876" target="_blank">Transaction Logs (Zenodo)</a>
  <a class="btn btn-default" href="{{ site.url }}{{ site.baseurl }}/publications">All Publications</a>
</p>

<p class="small text-muted">
  <strong>Citation:</strong> Raja Hasnain Anwar, Gerard DeCunha, Muhammad Taqi Raza.
  "Zombie Cards Back Online: Reviving Expired Credit Cards for Contactless Payments."
  <em>USENIX Security 2026</em>.
</p>

## FAQ

<dl>
  <dt>Q: How realistic is it for an attacker to obtain an expired card?</dt>
  <dd>The attack exploits a documented misconception — expired cards are widely assumed inert, so cardholders discard them carelessly. The precondition is not wide availability; it is improper disposal by a subset of cardholders. Following issuer guidance to physically destroy the card eliminates the precondition entirely.</dd>

  <dt>Q: What factors most determine whether the attack succeeds?</dt>
  <dd>Three factors dominate: (i) which EMV kernel is in use and whether it cryptographically binds expiry-relevant fields; (ii) whether the issuer authorizes against the (PAN, expiry) tuple or just checks that the PAN is active; and (iii) whether the terminal's validation results reach the issuer via TVR. Transaction amount, merchant category, and POS terminal brand did not independently determine the outcome.</dd>

  <dt>Q: Does the attack work at any transaction amount?</dt>
  <dd>Yes. Once the terminal accepts the modified expiry and the issuer does not enforce instrument-level checks, the attack succeeds across all tested amounts ($1, $100, $500). PIN thresholds in European deployments are a separate check orthogonal to the expiry-integrity gap.</dd>

  <dt>Q: Does relay latency cause timeouts? Would Relay Resistance Protocol (RRP) block this?</dt>
  <dd>The relay added 20–50 ms per APDU round-trip (~415 ms total) — within the 500 ms EMV response window; no timeouts occurred. RRP would defeat the relay by detecting added latency and aborting, but RRP is optional and was not deployed on any card or terminal we tested.</dd>

  <dt>Q: Was IRB required? Did the experiments violate terms of service?</dt>
  <dd>IRB approval was not required — no human subjects were involved. All controlled experiments used our own cards and merchant account. In-the-wild merchants were informed in advance and all charges were paid in full. Our use of standard EMV cards and commercial terminals falls within normal cardholder use.</dd>

  <dt>Q: Why is the relay code not released?</dt>
  <dd>The implementation provides a direct capability to modify live financial transactions and could lower the barrier to fraud. As of publication, Visa and affected banks have not confirmed mitigation status. We release sanitized transaction logs and full protocol-level detail — consistent with prior EMV research that withheld exploit-capable artifacts while disclosing complete methodology.</dd>

  <dt>Q: Were Visa and the banks notified?</dt>
  <dd>Yes — in May 2025 and December 2025, with a step-by-step reproduction guide, full APDU traces, and a video demonstration. Visa's report has passed initial triage and is undergoing reproduction by their red team. Neither Visa nor the notified banks has provided an update on the nature or timeline of mitigations.</dd>
</dl>

<hr />
<p class="text-center text-muted"><small>Khwarizmi Lab &middot; University of Massachusetts Amherst &middot; <a href="mailto:rhasnain@cs.umass.edu">Contact</a></small></p>

