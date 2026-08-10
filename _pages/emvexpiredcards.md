---
title: "Expired Card Attack"
layout: textlay
excerpt: "Zombie Cards: Reviving Expired Credit Cards for Contactless Payments. We demonstrate a practical Zombie Card attack that makes an expired card appear unexpired, allowing successful transactions despite the card being past its printed date."
sitemap: true
permalink: /emvexpiredcards/
---

<!-- ─────────────────── HERO ─────────────────── -->
<div class="text-center">
  <h1>Zombie Cards Back Online</h1>
  <h2>Reviving Expired Credit Cards for Contactless Payments</h2>
  <p class="zombie-authors">
    <a href="https://rhasnainanwar.me/" target="_blank">Raja Hasnain Anwar</a> &nbsp;·&nbsp;
    Gerard DeCunha &nbsp;·&nbsp;
    <a href="https://people.umass.edu/~taqi/" target="_blank">Muhammad Taqi Raza</a>
  </p>
  <p>
    <a class="btn btn-default" data-toggle="collapse" href="#abstract-collapse" aria-expanded="false">Abstract</a>
    <a class="btn btn-default" href="#">Paper (PDF)</a>
    <a class="btn btn-default" href="#bibtex">Citation (Bib)</a>
  </p>
</div>

---

<div id="abstract-collapse" class="collapse" markdown="0">
<h2 id="abstract">Abstract</h2>
<div class="well well-sm">
Most people reasonably assume that an expired card has become useless. Our research asks a simple
question: <strong>is that always true?</strong> We found that, in some contactless Visa payment setups,
an expired card can still be accepted when someone changes the expiry date shown to the checkout
terminal. The card's built-in cryptography continues to look genuine, and some banks do not receive
enough reliable information to recognize that the physical card has expired.

We tested this finding with real cards, terminals, merchants, and five major US banks. Visa was the
susceptible configuration in our experiments; the Mastercard, American Express, and Discover
configurations we tested rejected the change. The result is not that card cryptography has been
broken. It is a gap between systems that each assume someone else has checked whether a card should
still be usable. We describe the gap and the changes that can close it.
</div>
</div>

## Why We Looked at Expired Cards

<p>
When a replacement card arrives, the old one is often treated as harmless. People put it in a drawer,
throw it away, or assume that the date printed on it automatically prevents any future use. That is a
reasonable expectation. A card should not become usable again simply because different parts of the
payment system disagree about whether it has expired.
</p>

<p>
Contactless payments involve a card, the shop's checkout terminal, the merchant's bank, a payment
network such as Visa or Mastercard, and the cardholder's bank. Each has a small part of the decision.
The important question is whether those parts agree on one basic fact: <strong>is this particular card
still valid?</strong>
</p>

<blockquote>
<strong>The short version:</strong> the terminal and the bank can see expiry information in different
places. In the Visa configuration we studied, the terminal's copy was not protected in the same way
as the card's other security information. That left room for the two sides to reach different answers.
</blockquote>

## What We Found

<p>
The card gives the checkout terminal an expiry date to read. In the Visa contactless configuration
we tested, that particular date was not covered by the card's digital signature. Someone positioned
between the card and terminal could therefore alter what the terminal sees while leaving the card's
normal security checks looking valid.
</p>

<div class="row" markdown="0">
<div class="col-sm-12">
<img src="{{ site.url }}{{ site.baseurl }}/images/emv/attack_setup.jpg" alt="Theoretical attack setup: POS terminals, NFC relay over smartphones, and victim card" class="img-responsive center-block" />
<p class="text-center"><small>Our controlled demonstration relays the conversation between a checkout terminal and an expired card. The relay changes the expiry information shown to the terminal while the card's normal security responses continue to travel between the two devices.</small></p>
</div>
</div>

<div class="panel panel-default" markdown="0">
<div class="panel-heading"><strong>How the gap leads to a payment</strong></div>
<ul class="list-group">
<li class="list-group-item"><strong>1. An old card is treated as disposable.</strong> The starting point is an expired card that was not securely destroyed.</li>
<li class="list-group-item"><strong>2. The terminal is shown a different date.</strong> In our controlled setup, a relay sits between the card and checkout terminal and changes the expiry value the terminal reads.</li>
<li class="list-group-item"><strong>3. The card still looks genuine.</strong> The altered value is outside the signature checked by this Visa configuration, so the terminal's usual cryptographic check does not reveal the change.</li>
<li class="list-group-item"><strong>4. The bank may lack the warning it needs.</strong> The payment reaches the issuer with a valid card cryptogram, while the terminal's view of expiry and the issuer's view are not reliably tied together.</li>
<li class="list-group-item"><strong>5. The outcome depends on the issuer.</strong> A bank that verifies the status of this exact card can decline it. A bank that mainly sees an active account may approve it.</li>
</ul>
</div>

<p>
This is why we call it a <strong>Zombie Card</strong>: the card is supposed to be retired, yet it can appear
alive to part of the payment system. It does not mean every expired card works, and it does not mean
an ordinary cardholder is expected to defend against a complex technical attack. It means expiry has
to be enforced consistently by the payment system itself.
</p>

## Demo Video

<!-- Replace VIDEO_ID with the actual YouTube video ID -->
<div class="embed-responsive embed-responsive-16by9">
  <iframe class="embed-responsive-item"
          src="https://drive.google.com/file/d/1zcY1UUgrwSN3ZZhwojZOSkexK7pHfSmR/preview"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
</div>
<p class="text-center"><small>A live demonstration of the Zombie Card attack: an expired Visa card completing a $100 contactless transaction at a real POS terminal.</small></p>

## What We Tested

<p>
We tested the issue using our own expired cards, Android phones in a controlled relay setup, and
commercial payment terminals. We also validated the behavior with informed merchants and paid every
test charge in full. The study covered Visa, Mastercard, Discover, and American Express cards from
five major US banks, as well as Apple Pay and Google Pay.

The result was specific, not universal: the Visa configuration we tested could be affected; the
Mastercard, American Express, and Discover configurations we tested rejected the altered expiry
information. Banks also differed. Some declined the payment or asked for the replacement card, while
others approved it. That variation is the central lesson: the protection depends on the whole payment
chain, not on the plastic card alone.
</p>

<div class="row" markdown="0">
<div class="col-sm-12">
<img src="{{ site.url }}{{ site.baseurl }}/images/emv/setup.jpg" alt="Experimental setup: SumUp terminals, CardEmulator phone, POSEmulator phone, and victim card" class="img-responsive center-block" />
<p class="text-center"><small>Our test equipment: commercial terminals, a companion merchant app, two Android phones used for the controlled relay, and an expired test card.</small></p>
</div>
</div>

<div class="row" markdown="0">
<div class="col-sm-6 col-sm-offset-3">
<img src="{{ site.url }}{{ site.baseurl }}/images/emv/receipt.png" alt="Receipt showing $100 approved transaction on an expired Visa card" class="img-responsive center-block" />
<p class="text-center"><small>A receipt from our controlled test: a $100 contactless payment was approved on an expired Visa card.</small></p>
</div>
</div>

<strong id="bibtex">BibTeX</strong>
<pre>@inproceedings{anwar2026zombie,
  title={Zombie Cards Back Online: Reviving Expired Credit Cards for Contactless Payments},
  author={Anwar, Raja Hasnain and DeCunha, Gerard and Raza, Muhammad Taqi},
  booktitle={USENIX Security 26},
  year={2026}
}</pre>

## FAQ

<p class="text-muted"><small>Click a question to reveal the answer; click again to hide it.</small></p>

<div id="faq" class="row" markdown="0">

<!-- ───────────── Column 1 ───────────── -->
<div class="col-sm-6">

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq1">What is the "Zombie Card" attack, in one sentence?</a></div>
<div id="faq1" class="panel-collapse collapse"><div class="panel-body">
It is a way to make a checkout terminal see an expired contactless card as current, even though the card's printed date has passed.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq2">Is this a flaw in EMV's cryptography?</a></div>
<div id="faq2" class="panel-collapse collapse"><div class="panel-body">
Not in the usual sense. We did not break the card's keys or forge its security responses. The problem is that the expiry date checked by the terminal is not bound tightly enough to the information the bank uses to authorize the payment. It is a gap in how the system enforces the card's lifecycle.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq3">How realistic is it for an attacker to obtain an expired card?</a></div>
<div id="faq3" class="panel-collapse collapse"><div class="panel-body">
The attack begins with a physical expired card, so it is not a remote attack against every cardholder. The concern is that expired cards are commonly seen as worthless and may be discarded carelessly. Cutting through the chip and magnetic stripe, or returning the card through the issuer's approved process, removes that starting point.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq4">Which cards and banks are affected?</a></div>
<div id="faq4" class="panel-collapse collapse"><div class="panel-body">
In our tests, the susceptible configuration was Visa contactless. The Mastercard, American Express, and Discover configurations we tested rejected the changed expiry information. We tested cards from five major US banks, which we anonymize as Banks A-E. Bank behavior varied: some payments were declined or prompted for the replacement card, while others were approved. These results describe our tested cards and transactions, not every card issued by a network or bank.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq5">Does this affect Apple Pay or Google Pay?</a></div>
<div id="faq5" class="panel-collapse collapse"><div class="panel-body">
Digital wallets are generally better placed to handle card replacement because their payment tokens can be updated remotely. In our testing, their centralized lifecycle management reduced the chance that an expired physical credential would remain usable. That is not a promise that every wallet implementation is immune; it is a reason to make expiry checks end-to-end rather than leave them to a terminal alone.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq6">What factors most determine whether the attack succeeds?</a></div>
<div id="faq6" class="panel-collapse collapse"><div class="panel-body">
Three things matter most: the payment network's terminal rules, whether the issuing bank checks the status of this exact card rather than only the account, and whether the bank receives a trustworthy expiry warning from the terminal. In our tests, payment amount, merchant type, and terminal brand did not by themselves explain the outcome.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq7">How is this different from prior EMV attacks?</a></div>
<div id="faq7" class="panel-collapse collapse"><div class="panel-body">
Prior EMV research has shown problems involving PIN checks, card-brand handling, and relay attacks. Our focus is different: a card's expiry should be a simple end-to-end promise that it is no longer usable. We show how that promise can become only a local terminal check, rather than a fact the entire payment chain verifies.
</div></div>
</div>

</div>

<!-- ───────────── Column 2 ───────────── -->
<div class="col-sm-6">

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq8">Does the attack work at any transaction amount?</a></div>
<div id="faq8" class="panel-collapse collapse"><div class="panel-body">
In our tests, the underlying expiry issue did not depend on the amount: we observed it at $1, $100, and $500 when the terminal and issuer conditions allowed it. Other rules, such as a PIN requirement in some countries, may still stop a particular payment. Those rules are separate from the expiry problem.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq9">Does relay latency cause timeouts? Would Relay Resistance Protocol (RRP) block this?</a></div>
<div id="faq9" class="panel-collapse collapse"><div class="panel-body">
In our setup, the extra delay stayed within the payment system's normal response allowance, so we saw no timeouts. A protection called Relay Resistance Protocol can detect an added relay and stop the transaction, but it is optional and was not enabled on the cards or terminals we tested.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq10">As a normal cardholder, am I at risk — and what should I do?</a></div>
<div id="faq10" class="panel-collapse collapse"><div class="panel-body">
You do not need to change how you use contactless payments. When a card expires, follow your bank's disposal guidance: cut through the chip and magnetic stripe, or return it through an approved channel. An expired card that has been securely destroyed cannot be used in this way.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq11">Was IRB required? Did the experiments violate terms of service?</a></div>
<div id="faq11" class="panel-collapse collapse"><div class="panel-body">
IRB approval was not required because the study did not involve human subjects. We used our own cards and merchant account for controlled tests. For tests at operating merchants, merchants were informed in advance and every charge was paid in full.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq12">Why is the relay code not released?</a></div>
<div id="faq12" class="panel-collapse collapse"><div class="panel-body">
The code could be used to alter live financial transactions and would lower the barrier to fraud. Because the affected organizations have not confirmed a mitigation, we are not releasing exploit-capable software. We do provide sanitized transaction logs and the protocol detail needed to understand and address the issue.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq13">Were Visa and the banks notified?</a></div>
<div id="faq13" class="panel-collapse collapse"><div class="panel-body">
Yes. We notified Visa and the relevant banks in May and December 2025, providing a reproduction guide, transaction traces, and a video demonstration. Visa's report passed initial triage and was being reproduced by its red team. At the time of writing, neither Visa nor the notified banks had confirmed a mitigation.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq14">Has a CVE been assigned to this issue?</a></div>
<div id="faq14" class="panel-collapse collapse"><div class="panel-body">
No CVE has been assigned as of the publication date. The issue concerns how payment-network rules, terminals, and issuer checks work together, rather than a single consumer software product. We will update this page if a public tracking identifier becomes available.
</div></div>
</div>

<div class="panel panel-default">
<div class="panel-heading"><a data-toggle="collapse" href="#faq15">Does it also work on debit cards or contact (chip-insert) transactions?</a></div>
<div id="faq15" class="panel-collapse collapse"><div class="panel-body">
Our reported result concerns contactless Visa transactions. Whether a particular debit card is affected depends on its payment application, the terminal rules, and the issuing bank's checks; it should not be inferred from the card's label alone. We did not establish that the same issue applies to chip-insert transactions, which use a different interaction path and should be evaluated separately.
</div></div>
</div>

</div>

</div>
