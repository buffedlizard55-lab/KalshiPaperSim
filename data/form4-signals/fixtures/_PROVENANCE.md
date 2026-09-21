# Form 4 parser fixture — provenance (read before trusting this file)

**File:** `0001104659-26-106432.xml`

**Source (official):** SEC EDGAR full submission text
<https://www.sec.gov/Archives/edgar/data/1318605/000110465926106432/0001104659-26-106432.txt>
(the `<DOCUMENT>`/`<TEXT>`/`<XML>` payload of that filing).
Filing directory: <https://www.sec.gov/Archives/edgar/data/1318605/000110465926106432/>
Listed by EDGAR's own feed:
<https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=4&dateb=&owner=include&count=5&output=atom>

**Retrieved:** 2026-09-21 (~04:03 UTC) by the Arena agent for this repository.

**Filing facts carried by the SEC header of that submission (verbatim values):**

| Field | Value |
|---|---|
| ACCESSION NUMBER | 0001104659-26-106432 |
| ACCEPTANCE-DATETIME | `20260909190010` (2026-09-09 19:00:10 ET) |
| CONFORMED SUBMISSION TYPE | 4 |
| CONFORMED PERIOD OF REPORT | 20260905 |
| FILED AS OF DATE | 20260909 |
| Reporting owner | Taneja Vaibhav, CIK 0001771340 |
| Issuer | Tesla, Inc., CIK 0001318605 |

**What is verbatim and what is not — stated plainly:**

* VERBATIM: every element and value from `<ownershipDocument>` through the
  `<derivativeTable>`'s first `<derivativeTransaction>` up to and including
  `<exerciseDate><footnoteId id="F4"/></exerciseDate>`. That is the whole
  `<issuer>` block, the whole `<reportingOwner>` block, both
  `<nonDerivativeTransaction>` rows, the `<nonDerivativeHolding>` row and the
  RSU derivative row, character for character.
* NOT REPRODUCED: the tail of the live document — the remainder of the
  `<derivativeTable>` (expiration date / underlying security / post-transaction
  derivative amounts / ownership nature), the `<footnotes>` block (F1–F4+), the
  `<ownerSignature>` block and the trailing `</XML></TEXT></DOCUMENT>`
  wrappers. The retrieval returned the submission in two pages and only the
  first page could be fetched in this session.
* STRUCTURAL ONLY (not from the filing): the closing `</exerciseDate>`,
  `</derivativeTransaction>`, `</derivativeTable>` and `</ownershipDocument>`
  tags appended so the fixture is well-formed XML for the parser test. No
  element, value or number was invented.

The parser (`scripts/archive-form4-signals.mjs#parseOwnershipDocument`) does not
read footnotes or signatures, so the truncation cannot make a test pass that a
complete document would fail. The first live workflow run is the first parse of
a complete filing; `--verify` audits every archived row.

Element names are the ones in the SEC's own EDGAR Ownership XML Technical
Specification: <https://www.sec.gov/info/edgar/ownershipxmltechspec-v3.pdf>.
