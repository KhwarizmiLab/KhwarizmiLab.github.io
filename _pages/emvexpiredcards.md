---
title: "Zombie Cards Back Online"
layout: textlay
excerpt: "Zombie Cards: Reviving Expired Credit Cards for Contactless Payments"
sitemap: true
permalink: /emvexpiredcards/
---

<!-- ─────────────────── HERO ─────────────────── -->
<div class="text-center">
  <h1>Zombie Cards Back Online</h1>
  <h4>Reviving Expired Credit Cards for Contactless Payments</h4>
  <p>
    <a href="https://rhasnainanwar.me/" target="_blank">Raja Hasnain Anwar</a> &nbsp;·&nbsp;
    Gerard DeCunha &nbsp;·&nbsp;
    <a href="https://people.cs.umass.edu/~taqi/" target="_blank">Muhammad Taqi Raza</a>
  </p>
  <p>
    <a class="btn btn-default" href="#">Paper (PDF)</a>
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

<strong>BibTeX</strong>
<pre>@inproceedings{anwar2026zombie,
  title={Zombie Cards Back Online: Reviving Expired Credit Cards for Contactless Payments},
  author={Anwar, Raja Hasnain and DeCunha, Gerard and Raza, Muhammad Taqi},
  booktitle={USENIX Security 26},
  year={2026}
}</pre>


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

<p>
EMV (Europay, Mastercard, Visa) is the global standard governing chip-based card payments.
In a <strong>contactless transaction</strong>, the card and a Point-of-Sale (POS) terminal exchange
Application Protocol Data Units (APDUs) over NFC. Five parties participate:
</p>

<div class="row" markdown="0">
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

<div class="panel panel-default" markdown="0">
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

<div class="row" markdown="0">
<div class="col-sm-12">
<img src="{{ site.url }}{{ site.baseurl }}/images/emv/setup.jpg" alt="Experimental setup: SumUp terminals, CardEmulator phone, POSEmulator phone, and victim card" class="img-responsive center-block" />
<p class="text-center"><small>Experimental setup. (1) SumUp Plus terminal, (2) companion merchant app, (3) SumUp Solo terminal, (4) CardEmulator phone presenting card data to the terminal, (5) victim expired card, (6) POSEmulator phone reading and relaying card APDUs.</small></p>
</div>
</div>

<div class="row" markdown="0">
<div class="col-sm-6">
<img src="{{ site.url }}{{ site.baseurl }}/images/emv/CardEmulator.jpg" alt="CardEmulator app showing relayed APDU commands and responses" class="img-responsive" />
<p class="text-center"><small>CardEmulator — relayed APDU commands and responses at the terminal side.</small></p>
</div>
<div class="col-sm-6">
<img src="{{ site.url }}{{ site.baseurl }}/images/emv/POSEmulator.jpg" alt="POSEmulator app showing card APDU reads" class="img-responsive" />
<p class="text-center"><small>POSEmulator — APDU reads from the victim expired card.</small></p>
</div>
</div>

<div class="row" markdown="0">
<div class="col-sm-6 col-sm-offset-3">
<img src="{{ site.url }}{{ site.baseurl }}/images/emv/receipt.png" alt="Receipt showing $100 approved transaction on an expired Visa card" class="img-responsive center-block" />
<p class="text-center"><small>Transaction receipt for a $100 contactless payment approved on an expired Visa card ending in 8634, as shown in the video.</small></p>
</div>
</div>


## FAQ

<p class="text-muted"><small>Click a question to reveal the answer; click again to hide it.</small></p>

<div id="faq" class="row" markdown="0">

<!-- ───────────── Column 1 ───────────── -->
<div class="col-sm-6">

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq1">What is the "Zombie Card" attack, in one sentence?</a></div>
<div id="faq1" class="panel-collapse collapse"><div class="panel-body">
It is an NFC man-in-the-middle attack that rewrites the expiration date a POS terminal reads from an expired card, making the card appear valid so the transaction is approved — without breaking any cryptography.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq2">Is this a flaw in EMV's cryptography?</a></div>
<div id="faq2" class="panel-collapse collapse"><div class="panel-body">
No. The card's keys, signatures (SDAD), and cryptograms (ARQC) remain valid throughout. The gap is that Visa Kernel 3 does not bind the terminal-read expiration date to any authenticated data, so it can be modified in transit undetected. This is a lifecycle-enforcement gap, not a cryptographic break.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq3">How realistic is it for an attacker to obtain an expired card?</a></div>
<div id="faq3" class="panel-collapse collapse"><div class="panel-body">
The attack exploits a documented misconception — expired cards are widely assumed inert, so cardholders discard them carelessly. The precondition is improper disposal by a subset of cardholders, not wide availability. Following issuer guidance to physically destroy the card eliminates the precondition entirely.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq4">Which cards and banks are affected?</a></div>
<div id="faq4" class="panel-collapse collapse"><div class="panel-body">
Visa (Kernel 3) was the susceptible configuration; Mastercard (Kernel 2), AmEx (Kernel 4), and Discover (Kernel 6) rejected the modification. We tested five major US banks (anonymized as Bank A–E). Issuer behavior varied: some approved revived transactions, others declined and prompted for the replacement card.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq5">Does this affect Apple Pay or Google Pay?</a></div>
<div id="faq5" class="panel-collapse collapse"><div class="panel-body">
Digital wallets are more resilient. Their tokens and expiry are refreshed over-the-air by the issuer's token service provider, without cardholder action, reducing the chance that an expired underlying credential stays usable. Centralized lifecycle management is more robust than terminal-local policy checks.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq6">What factors most determine whether the attack succeeds?</a></div>
<div id="faq6" class="panel-collapse collapse"><div class="panel-body">
Three: (i) which EMV kernel is in use and whether it cryptographically binds expiry-relevant fields; (ii) whether the issuer authorizes against the (PAN, expiry) tuple or only checks that the PAN is active; and (iii) whether terminal validation results reach the issuer via TVR. Amount, merchant category, and POS brand did not independently determine the outcome.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq7">How is this different from prior EMV attacks?</a></div>
<div id="faq7" class="panel-collapse collapse"><div class="panel-body">
Prior work targeted PIN/CVM bypass, brand mix-ups, or relay proximity. We instead treat card expiry as an end-to-end lifecycle invariant and show it degrades into a policy-only attribute. The attack requires no induced authentication failure and no brand routing — only an unbound, terminal-consumed expiry field.
</div></div>
</div>

</div>

<!-- ───────────── Column 2 ───────────── -->
<div class="col-sm-6">

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq8">Does the attack work at any transaction amount?</a></div>
<div id="faq8" class="panel-collapse collapse"><div class="panel-body">
Yes. Once the terminal accepts the modified expiry and the issuer does not enforce instrument-level checks, the attack succeeds across all tested amounts ($1, $100, $500). PIN thresholds in European deployments are a separate check, orthogonal to the expiry-integrity gap.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq9">Does relay latency cause timeouts? Would Relay Resistance Protocol (RRP) block this?</a></div>
<div id="faq9" class="panel-collapse collapse"><div class="panel-body">
The relay added 20–50 ms per APDU round-trip (~415 ms total) — within the 500 ms EMV response window; no timeouts occurred. RRP would defeat the relay by detecting the added latency and aborting, but RRP is optional and was not deployed on any card or terminal we tested.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq10">As a normal cardholder, am I at risk — and what should I do?</a></div>
<div id="faq10" class="panel-collapse collapse"><div class="panel-body">
The simplest protection is to follow issuer guidance for expired cards: physically destroy them by cutting through the chip and magnetic stripe, or return them through an approved channel. An expired card you have securely destroyed cannot be used in this attack.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq11">Was IRB required? Did the experiments violate terms of service?</a></div>
<div id="faq11" class="panel-collapse collapse"><div class="panel-body">
IRB approval was not required — no human subjects were involved. Controlled experiments used our own cards and merchant account. In-the-wild merchants were informed in advance and all charges were paid in full. Use of standard EMV cards and commercial terminals falls within normal cardholder use.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq12">Why is the relay code not released?</a></div>
<div id="faq12" class="panel-collapse collapse"><div class="panel-body">
The implementation provides a direct capability to modify live financial transactions and could lower the barrier to fraud. As of publication, Visa and affected banks have not confirmed mitigation status. We release sanitized transaction logs and full protocol-level detail — consistent with prior EMV research that withheld exploit-capable artifacts.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq13">Were Visa and the banks notified?</a></div>
<div id="faq13" class="panel-collapse collapse"><div class="panel-body">
Yes — in May 2025 and December 2025, with a step-by-step reproduction guide, full APDU traces, and a video demonstration. Visa's report has passed initial triage and is undergoing reproduction by their red team. As of writing, neither Visa nor the notified banks has provided an update on mitigations.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq14">Has a CVE been assigned to this issue?</a></div>
<div id="faq14" class="panel-collapse collapse"><div class="panel-body">
<!-- TODO: Confirm whether a CVE / tracking ID has been assigned and add it here. -->
[Answer to be added.]
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq15">Does it also work on debit cards or contact (chip-insert) transactions?</a></div>
<div id="faq15" class="panel-collapse collapse"><div class="panel-body">
<!-- TODO: Confirm debit-card and contact-interface behavior and add details here. -->
[Answer to be added.]
</div></div>
</div>

</div>

</div>
