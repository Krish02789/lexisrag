/**
 * Seed the database with 100 US Tax & Legal documents and 50 golden set entries.
 * Auto-reseeds if document count changes.
 */

import { db } from "@workspace/db";
import {
  legalDocumentsTable,
  documentChunksTable,
  goldenSetEntriesTable,
} from "@workspace/db";
import { logger } from "./logger";

interface DocSeed {
  title: string;
  docType: string;
  description: string;
  pages: { pageNum: number; content: string }[];
}

const DOCUMENTS: DocSeed[] = [
  // ── ACTS (30) ──────────────────────────────────────────────────────────────
  {
    title: "Tax Cuts and Jobs Act of 2017",
    docType: "Act",
    description: "Comprehensive federal tax reform enacted December 22, 2017, representing the largest overhaul of the U.S. tax code since 1986.",
    pages: [
      { pageNum: 1, content: "The Tax Cuts and Jobs Act of 2017 (TCJA), Pub. L. No. 115-97, represents the most significant overhaul of the United States Internal Revenue Code since the Tax Reform Act of 1986. Enacted on December 22, 2017, the legislation fundamentally altered individual, corporate, and estate taxation. The Act modified tax rates across individual income brackets, reduced the corporate income tax rate, created a new deduction for pass-through business income, and imposed new limitations on various deductions. The stated objectives included simplifying the tax code, stimulating economic growth, and improving the competitiveness of American businesses in the global marketplace." },
      { pageNum: 2, content: "Individual Income Tax Provisions: The TCJA nearly doubled the standard deduction for all filing statuses. For married taxpayers filing jointly, the standard deduction was increased from $12,700 to $24,000. Single filers received an increase from $6,350 to $12,000. The personal exemption of $4,050 per person was eliminated. The child tax credit was doubled from $1,000 to $2,000 per qualifying child, with up to $1,400 being refundable. The credit begins to phase out for married joint filers with adjusted gross income exceeding $400,000, compared to the prior $110,000 threshold." },
      { pageNum: 3, content: "Corporate Taxation: Section 11 of the Internal Revenue Code was amended to establish a flat corporate income tax rate of 21 percent, effective for taxable years beginning after December 31, 2017. This represented a reduction from the prior graduated corporate rate structure, under which the highest marginal rate was 35 percent. The alternative minimum tax for corporations was repealed. The Act adopted a territorial tax system for multinational corporations, replacing the prior worldwide tax system. Under the new system, dividends received from foreign subsidiaries in which a domestic corporation holds at least a 10 percent ownership interest are generally exempt from U.S. taxation." },
      { pageNum: 4, content: "Pass-Through Business Income Deduction: New Section 199A was added to the Code, creating a deduction equal to 20 percent of qualified business income (QBI) from partnerships, S corporations, and sole proprietorships. The deduction is subject to limitations based on the taxpayer's taxable income, the nature of the business, and the amount of W-2 wages paid. Specified service trades or businesses — including law, accounting, health, financial services — are excluded from the QBI deduction once the taxpayer's income exceeds certain thresholds ($315,000 for married filing jointly; $157,500 for others). The individual provisions are scheduled to expire after December 31, 2025, absent further legislative action." },
    ],
  },
  {
    title: "Internal Revenue Code Section 61 – Gross Income Defined",
    docType: "Act",
    description: "The foundational provision defining gross income for federal income tax purposes as all income from whatever source derived.",
    pages: [
      { pageNum: 1, content: "Section 61(a) of the Internal Revenue Code provides the foundational definition of gross income for federal income tax purposes: 'Except as otherwise provided in this subtitle, gross income means all income from whatever source derived.' The broad sweep of this definition was intentional, reflecting Congress's desire to exercise its full taxing power under the Sixteenth Amendment. The provision enumerates fifteen specific categories of income, including compensation for services, income derived from business, gains from dealings in property, interest, rents, royalties, dividends, alimony, annuities, income from life insurance and endowment contracts, pensions, income from discharge of indebtedness, distributive share of partnership gross income, income in respect of a decedent, and income from an interest in an estate or trust." },
      { pageNum: 2, content: "The Supreme Court's definitive interpretation of Section 61 came in Commissioner v. Glenshaw Glass Co. (1955), where Chief Justice Warren articulated the governing standard: 'Here we have instances of undeniable accessions to wealth, clearly realized, and over which the taxpayers have complete dominion.' This three-part test requires (1) an accession to wealth, (2) clear realization, and (3) complete dominion over the received item. The scope of gross income extends to cash, property, and services received. The fair market value of property or services received is generally included in gross income. Income received in advance, constructively received, or received as economic benefit must also be included." },
      { pageNum: 3, content: "Exclusions from Gross Income: While Section 61 establishes the broadest possible scope for gross income, Sections 101 through 140 of the Code provide specific exclusions. Major exclusions include: life insurance proceeds paid by reason of the insured's death (Section 101); gifts and inheritances (Section 102); interest on state and municipal bonds (Section 103); compensation for injuries or sickness (Section 104); employer-provided fringe benefits (Sections 106, 119, 132); contributions to qualified retirement plans (Section 402); and discharge of indebtedness in bankruptcy or insolvency (Section 108). These exclusions are narrowly construed, and the taxpayer bears the burden of establishing that a specific exclusion applies." },
    ],
  },
  {
    title: "Internal Revenue Code Section 162 – Trade or Business Expenses",
    docType: "Act",
    description: "Authorizes deductions for ordinary and necessary expenses paid or incurred in carrying on a trade or business.",
    pages: [
      { pageNum: 1, content: "Section 162(a) of the Code allows deduction of 'all the ordinary and necessary expenses paid or incurred during the taxable year in carrying on any trade or business.' The provision enumerates three specific categories: (1) a reasonable allowance for salaries or other compensation for personal services actually rendered; (2) traveling expenses (including amounts expended for meals and lodging other than amounts which are lavish or extravagant under the circumstances) while away from home in the pursuit of a trade or business; and (3) rentals or other payments required to be made as a condition to the continued use or possession, for purposes of the trade or business, of property to which the taxpayer has not taken or is not taking title or in which he has no equity." },
      { pageNum: 2, content: "Ordinary and Necessary Standard: The Supreme Court in Welch v. Helvering (1933) established that 'ordinary' does not mean 'habitual' or 'frequently recurring,' but rather that the payment is of a common or frequent type in the business setting, even if the particular taxpayer has never made such a payment before. A payment is 'necessary' if it is appropriate and helpful to the development of the taxpayer's business — it need not be absolutely required or indispensable. Courts apply these standards based on the facts and circumstances of each case. Business meals are deductible at 50 percent under Section 274(n), subject to the requirement that the meal is directly related to or associated with the active conduct of a trade or business." },
      { pageNum: 3, content: "Section 162 Limitations and Related Provisions: Section 162(a) deductions are subject to numerous limitations. Section 162(c) disallows deductions for illegal bribes, kickbacks, or other illegal payments. Section 162(e) limits deductions for lobbying expenses. Section 162(f) disallows deductions for fines and penalties paid to a government. Section 162(m) limits deductions for executive compensation paid by publicly held corporations to $1 million per covered employee. The TCJA of 2017 significantly expanded the scope of Section 162(m) to cover more employees and eliminate the performance-based compensation exception. Entertainment expenses were fully disallowed by the TCJA, while business meals remain 50 percent deductible." },
    ],
  },
  {
    title: "Internal Revenue Code Section 1031 – Like-Kind Exchanges",
    docType: "Act",
    description: "Provides nonrecognition treatment for exchanges of real property held for productive use in a trade or business or for investment.",
    pages: [
      { pageNum: 1, content: "Section 1031(a)(1) provides: 'No gain or loss shall be recognized on the exchange of real property held for productive use in a trade or business or for investment if such real property is exchanged solely for real property of like kind which is to be held either for productive use in a trade or business or for investment.' Prior to the Tax Cuts and Jobs Act of 2017, Section 1031 applied to all types of property, including personal property. The TCJA limited nonrecognition treatment exclusively to real property exchanges, effective for exchanges completed after December 31, 2017, with a transition rule for ongoing exchanges." },
      { pageNum: 2, content: "Like-Kind Requirement: Real property is considered 'like-kind' to all other real property under a broad interpretation. Thus, an apartment building may be exchanged for farmland, a commercial office building, or raw land — all qualify as like-kind exchanges. The property does not need to be of equal grade or quality. However, real property located in the United States is not considered like-kind to real property located outside the United States. Improved property and unimproved property are generally considered like-kind to each other. The determination of whether property qualifies as 'real property' for Section 1031 purposes was addressed in regulations issued in 2020 under Treas. Reg. § 1.1031(a)-3." },
      { pageNum: 3, content: "Qualified Intermediary and Exchange Timing: Section 1031(a)(3) establishes the deferred exchange rules. For a valid deferred exchange, the taxpayer must identify replacement property within 45 days of transferring the relinquished property (the '45-day rule') and must receive replacement property within 180 days (the '180-day rule'). A qualified intermediary (QI) must hold exchange proceeds between the sale and purchase; any actual or constructive receipt by the taxpayer of the proceeds triggers recognition. The taxpayer may identify up to three properties of any value (the '3-property rule') or any number of properties whose total fair market value does not exceed 200 percent of the relinquished property's value (the '200-percent rule')." },
      { pageNum: 4, content: "Boot Rules: Under Section 1031(b), if a taxpayer receives money or other non-like-kind property (collectively referred to as 'boot') in addition to like-kind real property, gain is recognized to the extent of the boot received. Mortgage relief is treated as boot received; new mortgage assumed on replacement property is treated as boot paid. The netting rule allows a taxpayer to offset mortgage relief against new mortgage assumed, with net relief treated as boot received. Section 1031(c) provides that loss is never recognized in a like-kind exchange, even if the taxpayer receives boot. Under Section 1031(d), the basis of the replacement property equals the adjusted basis of the relinquished property, decreased by money received and increased by gain recognized." },
      { pageNum: 5, content: "Related Party Rules and Reverse Exchanges: Section 1031(f) imposes special restrictions on exchanges between related parties, disallowing nonrecognition treatment if either party disposes of the exchanged property within two years. A 'reverse exchange' — where the taxpayer acquires replacement property before disposing of relinquished property — is permitted under Revenue Procedure 2000-37, which provides a safe harbor for reverse exchanges through an Exchange Accommodation Titleholder (EAT). The EAT holds title to either the relinquished or replacement property during the exchange period. Reverse exchanges must be completed within 180 days of the EAT acquiring property." },
    ],
  },
  {
    title: "Internal Revenue Code Section 199A – Qualified Business Income Deduction",
    docType: "Act",
    description: "Creates a 20 percent deduction for qualified business income from pass-through entities, subject to various limitations.",
    pages: [
      { pageNum: 1, content: "Section 199A, enacted by the Tax Cuts and Jobs Act of 2017, allows non-corporate taxpayers — individuals, trusts, and estates — to deduct up to 20 percent of their qualified business income (QBI) from a qualified trade or business. The deduction is computed for each qualified trade or business separately and then aggregated. The total deduction is limited to 20 percent of the taxpayer's taxable income (reduced by net capital gains) for the taxable year. The provision is intended to provide pass-through entities with a tax benefit comparable to the corporate rate reduction from 35 percent to 21 percent under the TCJA." },
      { pageNum: 2, content: "Qualified Business Income Definition: QBI means the net amount of qualified items of income, gain, deduction, and loss with respect to any qualified trade or business of the taxpayer. To be included in QBI, the items must be effectively connected with the conduct of a trade or business within the United States. QBI specifically excludes: investment income (capital gains, dividends, interest not allocable to a trade or business); reasonable compensation paid to the taxpayer from the business; guaranteed payments to a partner for services rendered in his capacity as a partner; and the Section 707(c) guaranteed payments for capital." },
      { pageNum: 3, content: "Specified Service Trade or Business (SSTB): The most significant limitation on the Section 199A deduction applies to specified service trades or businesses (SSTBs). An SSTB is any trade or business involving the performance of services in: health (physicians, pharmacists, nurses, dentists); law (attorneys, paralegals, legal arbitrators); accounting (tax preparation, bookkeeping, auditing); actuarial science; performing arts; consulting (management, strategic, business, HR); athletics (sports teams, individual athletes, coaches); financial services (wealth management, brokerage, investment management); and brokerage services. Additionally, any trade or business where the principal asset is the reputation or skill of its employees or owners qualifies as an SSTB." },
      { pageNum: 4, content: "W-2 Wage and Qualified Property Limitations: For taxpayers above the income thresholds ($329,800 married filing jointly; $164,900 single for 2021, indexed for inflation), the Section 199A deduction is limited to the greater of: (1) 50 percent of W-2 wages paid with respect to the qualified trade or business, or (2) 25 percent of W-2 wages plus 2.5 percent of the unadjusted basis immediately after acquisition (UBIA) of all qualified property. 'Qualified property' means tangible property subject to depreciation that is held by and available for use in the qualified trade or business at the close of the taxable year. Property must be within its depreciable period (the later of 10 years from placement in service or the last full year of depreciation)." },
    ],
  },
  {
    title: "Internal Revenue Code Section 351 – Transfers to Corporations",
    docType: "Act",
    description: "Provides nonrecognition treatment when property is transferred to a corporation in exchange for stock in a Section 351 exchange.",
    pages: [
      { pageNum: 1, content: "Section 351(a) provides that no gain or loss shall be recognized if property is transferred to a corporation by one or more persons solely in exchange for stock of that corporation, and immediately after the exchange, such person or persons are in control of the corporation. 'Control' for purposes of Section 351 means ownership of stock possessing at least 80 percent of the total combined voting power of all classes of stock entitled to vote and at least 80 percent of the total number of shares of all other classes of stock of the corporation. The transferors must be 'in control' immediately after the exchange, meaning the 80 percent threshold must be met as a group by all parties who transferred property in the same transaction." },
      { pageNum: 2, content: "Boot in Section 351 Exchanges: Under Section 351(b), if the transferor receives money or other property (boot) in addition to stock, gain is recognized to the extent of the lesser of the boot received or the realized gain. No loss is recognized even if boot is received. The gain recognized is characterized based on the nature of the property transferred — capital gain if the transferred property is a capital asset, ordinary income if it is an ordinary income asset. The corporation's basis in the transferred property is the transferor's adjusted basis, increased by any gain recognized by the transferor. The transferor's basis in the stock received is the basis of the property transferred, decreased by boot received and increased by gain recognized." },
      { pageNum: 3, content: "Transfers of Services and Section 357: When a taxpayer transfers services (rather than property) to a corporation in exchange for stock, the fair market value of the stock received for services is includible in gross income as ordinary compensation — it is not covered by Section 351. A taxpayer who transfers a combination of property and services receives Section 351 treatment only for the portion of stock received in exchange for the property. Section 357(a) provides that a corporation's assumption of a transferor's liabilities in a Section 351 exchange is generally not treated as boot. However, Section 357(b) provides that if a principal purpose of the liability assumption was tax avoidance, all assumed liabilities are treated as boot. Section 357(c) requires recognition of gain when the amount of liabilities assumed exceeds the adjusted basis of property transferred." },
    ],
  },
  {
    title: "Internal Revenue Code Section 1221 – Capital Asset Defined",
    docType: "Act",
    description: "Defines capital assets by exclusion and establishes the framework for capital gain and loss treatment.",
    pages: [
      { pageNum: 1, content: "Section 1221(a) defines 'capital asset' as property held by the taxpayer (whether or not connected with his trade or business), but specifies eight categories of exclusions. The exclusions include: (1) stock in trade, inventory, or property held primarily for sale to customers in the ordinary course of trade or business; (2) depreciable property or real property used in a trade or business; (3) a copyright, literary, musical, or artistic composition, or similar property held by the creator or certain transferees; (4) accounts or notes receivable acquired in the ordinary course of a trade or business for services rendered or from the sale of inventory; (5) a U.S. government publication held by a taxpayer who paid less than the public sale price; (6) any commodities derivative financial instrument held by a commodities dealer; (7) any hedging transaction clearly identified as such before close of the day; and (8) supplies regularly used or consumed in the ordinary course of the taxpayer's trade or business." },
      { pageNum: 2, content: "Capital Gain Holding Periods and Rates: Section 1222 defines short-term capital gain or loss as gain or loss from the sale or exchange of a capital asset held for not more than one year. Long-term capital gain or loss arises from assets held for more than one year. The preferential tax rates for long-term capital gains under Section 1(h) are 0 percent, 15 percent, or 20 percent, depending on the taxpayer's taxable income. The 20 percent rate applies to high-income taxpayers (generally those in the top ordinary income bracket). Additionally, Section 1411 imposes a 3.8 percent Net Investment Income Tax on the lesser of net investment income or the excess of modified adjusted gross income over applicable thresholds ($200,000 single; $250,000 married filing jointly), making the effective top federal rate on long-term capital gains 23.8 percent." },
    ],
  },
  {
    title: "Internal Revenue Code Section 1245 – Depreciation Recapture",
    docType: "Act",
    description: "Requires recapture of depreciation deductions as ordinary income upon disposition of certain depreciable personal property.",
    pages: [
      { pageNum: 1, content: "Section 1245(a)(1) provides that upon the disposition of Section 1245 property, the taxpayer must recognize ordinary income equal to the lesser of (1) the amount of depreciation, amortization, or other deductions allowed with respect to the property, or (2) the amount of gain recognized on the disposition. Section 1245 property includes personal property subject to depreciation, amortization property, single-purpose agricultural or horticultural structures, storage facilities, and railroad grading or tunnel bore. The effect of Section 1245 recapture is to convert what would otherwise be capital gain into ordinary income, up to the amount of prior depreciation deductions." },
      { pageNum: 2, content: "Section 1250 – Real Property Depreciation Recapture: Section 1250 provides a parallel recapture mechanism for real property. However, Section 1250 recapture applies only to additional depreciation — the excess of the accelerated depreciation method over straight-line depreciation. Under current law (ACRS and MACRS), most real property must use straight-line depreciation, so Section 1250 recapture is minimal. Instead, the 'unrecaptured Section 1250 gain' concept in Section 1(h)(6) subjects the straight-line depreciation on real property to a maximum 25 percent tax rate, rather than the 15 or 20 percent long-term capital gain rates. This unrecaptured Section 1250 gain rule effectively implements a partial recapture mechanism for real estate depreciation." },
    ],
  },
  {
    title: "Internal Revenue Code Section 469 – Passive Activity Loss Rules",
    docType: "Act",
    description: "Limits the deduction of losses from passive activities to the amount of income from passive activities.",
    pages: [
      { pageNum: 1, content: "Section 469(a) disallows any passive activity loss for the taxable year. A passive activity loss is the amount by which aggregate losses from all passive activities exceed aggregate income from all passive activities. Passive activity losses disallowed for the current year are suspended and carried forward to future taxable years, where they may offset passive activity income. A 'passive activity' is any activity that involves the conduct of a trade or business in which the taxpayer does not materially participate, and any rental activity (with limited exceptions for real estate professionals). Material participation requires the taxpayer to be involved in the operations of the activity on a regular, continuous, and substantial basis, as defined by seven tests in the Treasury Regulations." },
      { pageNum: 2, content: "Real Estate Exceptions: Section 469(c)(7) provides a special exception for taxpayers who qualify as 'real estate professionals.' A taxpayer qualifies if (1) more than one-half of the personal services performed in trades or businesses during the year are performed in real property trades or businesses in which the taxpayer materially participates, and (2) the taxpayer performs more than 750 hours of services during the year in such real property trades or businesses. Real estate professionals may treat rental real estate losses as non-passive and therefore deductible against ordinary income. Additionally, Section 469(i) provides a $25,000 allowance for active participants in rental real estate activities, phased out ratably between AGI of $100,000 and $150,000." },
      { pageNum: 3, content: "Disposition of Passive Activities: Under Section 469(g), when a taxpayer disposes of his entire interest in a passive activity in a fully taxable transaction, any suspended passive activity losses from that activity may be fully deducted in the year of disposition. The losses are first netted against any income or gain from the activity in the current year, then against net income or gain from all other passive activities, and finally against income from any source. This 'freeing up' of suspended losses upon complete disposition is a significant planning opportunity and is often a key consideration in structuring the sale of passive activity interests." },
    ],
  },
  {
    title: "Internal Revenue Code Section 108 – Discharge of Indebtedness",
    docType: "Act",
    description: "Provides exclusions from gross income for certain cancelled debt, including debt cancelled in bankruptcy or insolvency.",
    pages: [
      { pageNum: 1, content: "Section 61(a)(12) provides that gross income includes income from the discharge of indebtedness. However, Section 108 provides several important exclusions. Under Section 108(a)(1), gross income does not include amounts from discharge of indebtedness if: (A) the discharge occurs in a Title 11 bankruptcy case; (B) the discharge occurs when the taxpayer is insolvent (to the extent of insolvency); (C) the indebtedness discharged is qualified farm indebtedness; (D) in the case of a taxpayer other than a C corporation, the indebtedness discharged is qualified real property business indebtedness; or (E) the discharge is of a student loan." },
      { pageNum: 2, content: "Tax Attribute Reduction: Exclusions under Section 108(a) come with a significant cost — the taxpayer must reduce certain tax attributes in an amount equal to the excluded discharge of indebtedness income. Under Section 108(b), tax attributes are reduced in the following order: (1) net operating losses; (2) general business tax credits; (3) minimum tax credits; (4) capital loss carryovers; (5) basis of property; (6) passive activity loss and credit carryovers; and (7) foreign tax credit carryovers. The tax attribute reduction prevents the taxpayer from receiving a double benefit — using the exclusion and then separately using the attributes to offset income in a future year." },
    ],
  },
  {
    title: "Internal Revenue Code Section 704 – Partner's Distributive Share",
    docType: "Act",
    description: "Governs the allocation of partnership income, gain, loss, deduction, and credit among partners.",
    pages: [
      { pageNum: 1, content: "Section 704(a) provides that a partner's distributive share of income, gain, loss, deduction, or credit is determined by the partnership agreement. This general rule reflects the contractual nature of partnerships and allows partners to negotiate custom economic arrangements. However, Section 704(b) provides that if the allocation in the partnership agreement does not have 'substantial economic effect,' the partner's distributive share is determined in accordance with the partner's interest in the partnership. The substantial economic effect test under Treasury Regulations Section 1.704-1(b) has two parts: (1) the allocation must have economic effect, and (2) the economic effect must be substantial." },
      { pageNum: 2, content: "Substantial Economic Effect Requirements: For an allocation to have economic effect under Regulation 1.704-1(b)(2)(ii), the partnership must maintain capital accounts in accordance with the regulations, liquidating distributions must be made in accordance with positive capital account balances, and each partner with a deficit capital account must be obligated to restore the deficit. The economic effect is 'substantial' if there is a reasonable possibility that the allocation will affect substantially the dollar amounts to be received by the partners, independent of tax consequences. The economic effect is not substantial if the after-tax economic consequences of the partners would be the same as if the allocation were not contained in the partnership agreement." },
    ],
  },
  {
    title: "Internal Revenue Code Section 355 – Spin-Offs and Split-Offs",
    docType: "Act",
    description: "Provides nonrecognition treatment for distributions of stock of a controlled subsidiary to shareholders.",
    pages: [
      { pageNum: 1, content: "Section 355 allows a corporation to distribute stock of a controlled corporation to its shareholders without recognition of gain or loss at either the corporate or shareholder level, provided specific requirements are met. A 'controlled corporation' is one in which the distributing corporation controls at least 80 percent of voting stock and 80 percent of each class of nonvoting stock. The three types of tax-free corporate separations are: (1) spin-offs, where the distributing corporation distributes subsidiary stock pro rata to its shareholders; (2) split-offs, where shareholders exchange distributing corporation stock for subsidiary stock; and (3) split-ups, where the distributing corporation liquidates after distributing the stock of two or more controlled subsidiaries." },
      { pageNum: 2, content: "Active Business Requirement: Section 355(b) requires that both the distributing corporation and the controlled corporation be engaged in the active conduct of a trade or business for at least five years before the distribution, and that the trade or business was not acquired in a taxable acquisition within the five-year period. The 'device' prohibition in Section 355(a)(1)(B) prevents taxpayers from using a spin-off to distribute earnings and profits in a manner that avoids dividend treatment. The IRS examines the overall transaction to determine whether the distribution has a bona fide corporate business purpose independent of tax savings, and whether a pre-distribution plan to sell the distributed shares existed." },
    ],
  },
  {
    title: "Internal Revenue Code Section 382 – NOL Limitations After Ownership Change",
    docType: "Act",
    description: "Limits use of pre-change net operating losses following an ownership change.",
    pages: [
      { pageNum: 1, content: "Section 382 limits the use of net operating loss (NOL) carryforwards and certain built-in losses of a loss corporation following an 'ownership change.' An ownership change occurs when the percentage of stock owned by one or more 5-percent shareholders increases by more than 50 percentage points over the lowest percentage owned by those shareholders during the testing period (generally three years). The annual Section 382 limitation equals the value of the loss corporation's stock immediately before the ownership change multiplied by the long-term tax-exempt rate published monthly by the IRS. Any NOLs in excess of the annual limitation are permanently lost if not used within the carryforward period." },
      { pageNum: 2, content: "Built-In Gains and Losses: Section 382 also applies to recognized built-in gains (RBIG) and recognized built-in losses (RBIL) during the five-year recognition period following an ownership change. A loss corporation has a 'net unrealized built-in loss' if the excess of the aggregate adjusted bases of its assets over the fair market value of those assets exceeds a threshold amount ($10 million or 15 percent of asset FMV). RBIL recognized during the recognition period is treated as a pre-change loss subject to the Section 382 limitation. Conversely, RBIG recognized during the recognition period increases the Section 382 limitation, allowing the loss corporation to use more of its pre-change NOLs." },
    ],
  },
  {
    title: "Internal Revenue Code Section 401(k) – Cash or Deferred Arrangements",
    docType: "Act",
    description: "Authorizes qualified cash or deferred arrangements allowing employees to defer compensation on a pre-tax basis.",
    pages: [
      { pageNum: 1, content: "Section 401(k) authorizes a qualified cash or deferred arrangement (CODA) as part of a profit-sharing or stock bonus plan. Under a CODA, an eligible employee may elect to have the employer make payments as contributions to the trust under the plan rather than receive the payments as current cash compensation. The elective deferrals are excludible from the employee's gross income and are not subject to FICA taxes. The annual limit on elective deferrals is $22,500 for 2023 ($23,000 for 2024), with an additional $7,500 catch-up contribution allowed for participants age 50 and older." },
      { pageNum: 2, content: "Nondiscrimination Testing: Section 401(k)(3) requires that a CODA satisfy the actual deferral percentage (ADP) test. The ADP for highly compensated employees (those earning more than $150,000 in 2023) generally cannot exceed the ADP for non-highly compensated employees by more than 2 percentage points, or 1.25 times the ADP of non-highly compensated employees. Employers may elect to use a safe harbor design that automatically satisfies the ADP test. Under the traditional safe harbor, the employer must make either a 3 percent of compensation non-elective contribution or a matching contribution of 100 percent of elective deferrals up to 3 percent of compensation plus 50 percent of elective deferrals between 3 and 5 percent." },
    ],
  },
  {
    title: "Internal Revenue Code Section 1411 – Net Investment Income Tax",
    docType: "Act",
    description: "Imposes a 3.8 percent surtax on the net investment income of high-income individuals, estates, and trusts.",
    pages: [
      { pageNum: 1, content: "Section 1411, enacted as part of the Affordable Care Act, imposes a 3.8 percent tax on the lesser of (1) net investment income, or (2) the excess of modified adjusted gross income over a threshold amount ($200,000 for single filers; $250,000 for married filing jointly). Net investment income (NII) includes: gross income from interest, dividends, annuities, royalties, and rents, other than such income derived in the ordinary course of a trade or business; net gain attributable to the disposition of property, other than property held in an ordinary course of a trade or business; and net passive activity income under Section 469. Passive activity income — including all rental income of non-real-estate professionals — is always included in NII regardless of the taxpayer's level of participation." },
    ],
  },
  {
    title: "Internal Revenue Code Section 7701 – Definitions",
    docType: "Act",
    description: "Contains foundational definitions used throughout the Internal Revenue Code, including the entity classification rules.",
    pages: [
      { pageNum: 1, content: "Section 7701(a) provides definitions for numerous terms used throughout the Code. Section 7701(a)(1) defines 'person' to include an individual, trust, estate, partnership, association, company, or corporation. Section 7701(a)(3) defines 'corporation' to include associations, joint-stock companies, and insurance companies. Section 7701(a)(2) defines 'partnership' to include a syndicate, group, pool, joint venture, or other unincorporated organization through or by means of which any business, financial operation, or venture is carried on, and which is not a corporation or trust or estate." },
      { pageNum: 2, content: "Check-the-Box Regulations: The Treasury Regulations under Section 7701 include the 'check-the-box' entity classification rules in Regulation 301.7701-1 through 301.7701-3. Under these rules, a business entity with two or more members is classified as either a corporation or a partnership; a business entity with a single member is either a corporation or a disregarded entity. Certain entities are per se corporations — publicly traded partnerships, insurance companies, and entities specifically required to be treated as corporations under other Code provisions. All other eligible entities may elect their classification by filing Form 8832. Absent an election, default classifications apply: a domestic eligible entity with two or more members defaults to partnership; a domestic eligible entity with a single member defaults to a disregarded entity." },
    ],
  },
  {
    title: "Internal Revenue Code Section 6662 – Accuracy-Related Penalty",
    docType: "Act",
    description: "Imposes a 20 percent penalty on underpayments attributable to negligence, substantial understatement, or valuation misstatements.",
    pages: [
      { pageNum: 1, content: "Section 6662(a) imposes a penalty equal to 20 percent of the portion of any underpayment attributable to certain types of tax misconduct. The accuracy-related penalty applies to underpayments attributable to: negligence or disregard of rules or regulations; substantial understatement of income tax; substantial valuation misstatement; substantial overstatement of pension liabilities; and substantial estate or gift tax valuation understatements. For substantial understatements, the penalty applies if the understatement exceeds the greater of 10 percent of the correct tax or $5,000. The penalty is increased to 40 percent for gross valuation misstatements and undisclosed foreign financial asset understatements." },
      { pageNum: 2, content: "Reasonable Cause Exception: Section 6664(c) provides that no accuracy-related penalty shall be imposed with respect to any portion of an underpayment if the taxpayer shows that there was reasonable cause for, and the taxpayer acted in good faith with respect to, that portion. The determination is made based on all pertinent facts and circumstances. Reliance on professional advice may constitute reasonable cause if: the taxpayer reasonably relied on the advice of a qualified tax advisor; the advisor was aware of all relevant facts; and the advice was not based on an analysis of the applicable law that the taxpayer knew or should have known was incorrect. The penalty does not apply to the extent the taxpayer adequately discloses the position on the return and has a reasonable basis for the position." },
    ],
  },
  {
    title: "Internal Revenue Code Section 1014 – Basis of Property Acquired from a Decedent",
    docType: "Act",
    description: "Provides a stepped-up basis for property acquired from a decedent, generally equal to the fair market value at date of death.",
    pages: [
      { pageNum: 1, content: "Section 1014(a) establishes the general rule that the basis of property in the hands of a person acquiring the property from a decedent is the fair market value of the property at the date of the decedent's death. This 'stepped-up basis' (or 'stepped-down basis' if the property has declined in value) eliminates any unrealized appreciation or depreciation that occurred during the decedent's lifetime. Section 1014(b) lists the types of property considered to have been acquired from a decedent, including property acquired by bequest, devise, or inheritance; property included in the gross estate for estate tax purposes; the surviving spouse's one-half share of community property if at least one-half of the whole of the property was includible in the decedent's gross estate." },
      { pageNum: 2, content: "Limitations and Exceptions: Section 1014(c) provides that Section 1014 does not apply to income in respect of a decedent (IRD) under Section 691. IRD items — such as unpaid salary, deferred compensation, distributions from IRAs or retirement plans, and installment obligations — retain their pre-death income tax character in the hands of the beneficiary and do not receive a step-up in basis. Section 1014(e) provides that if appreciated property is acquired by the decedent as a gift within one year of death and then passes to the original donor or donor's spouse, the property's basis is the decedent's adjusted basis rather than the fair market value at death, preventing the 'deathbed gift' basis-step-up scheme." },
    ],
  },
  {
    title: "Internal Revenue Code Section 1001 – Determination of Amount Realized and Recognized",
    docType: "Act",
    description: "Establishes the framework for computing gain or loss on the sale or other disposition of property.",
    pages: [
      { pageNum: 1, content: "Section 1001(a) provides that gain from the sale or other disposition of property is the excess of the amount realized over the adjusted basis of such property; loss is the excess of adjusted basis over amount realized. Section 1001(b) defines 'amount realized' as the sum of any money received plus the fair market value of property (other than money) received. This definition encompasses the full sales price, including the assumption by the buyer of the seller's liabilities on the property, as established in Crane v. Commissioner (1947). The term 'other disposition' is broadly construed to include exchanges, abandonment, condemnation, foreclosure, and involuntary conversion." },
      { pageNum: 2, content: "Realized vs. Recognized Gain: Section 1001(c) provides that the entire amount of gain or loss on a sale or exchange shall be recognized, except as otherwise provided in the Code. This default recognition rule is subject to numerous exceptions, including: Section 1031 (like-kind exchanges); Section 1033 (involuntary conversions); Section 121 (sale of principal residence); Section 351 (transfers to controlled corporations); Section 354 (exchanges of stock and securities in corporate reorganizations); Section 721 (contributions to partnerships); and Section 1041 (transfers between spouses). The realized gain or loss represents the economic profit or loss; the recognized gain or loss is the portion includible in or deductible from gross income under the Code." },
    ],
  },
  {
    title: "Internal Revenue Code Section 61 – Alimony and Separate Maintenance",
    docType: "Act",
    description: "TCJA changed the alimony tax treatment: pre-2019 divorces include alimony in income; post-2018 divorces do not.",
    pages: [
      { pageNum: 1, content: "Prior to the Tax Cuts and Jobs Act of 2017, Section 71 required that alimony received under a divorce or separation agreement was includible in the gross income of the recipient spouse and deductible by the payor spouse. This created an income-shifting mechanism allowing higher-income payors to transfer income to lower-bracket recipients. The TCJA fundamentally changed this treatment for divorce or separation instruments executed after December 31, 2018. Under the new rules, alimony payments are no longer deductible by the payor and are no longer includible in the gross income of the recipient. The TCJA did not change the treatment for pre-2019 agreements unless the agreement is modified and specifically provides that the TCJA rules apply." },
    ],
  },
  {
    title: "Internal Revenue Code Section 2001 – Imposition and Rate of Estate Tax",
    docType: "Act",
    description: "Imposes a graduated estate tax on the transfer of the taxable estate of every decedent who is a citizen or resident of the United States.",
    pages: [
      { pageNum: 1, content: "Section 2001(a) imposes a tax on the transfer of the taxable estate of every decedent who is a citizen or resident of the United States. The tax is computed by: (1) computing a tentative tax on the sum of the taxable estate and the adjusted taxable gifts using the unified rate schedule; (2) subtracting from the tentative tax the taxes that would have been payable on prior taxable gifts; and (3) subtracting the unified credit. The unified rate schedule under Section 2001(c) is graduated from 18 percent on the first $10,000 to 40 percent on taxable amounts over $1 million. The basic exclusion amount for 2023 is $12,920,000 per individual ($25,840,000 for married couples with proper planning), creating the unified credit that eliminates estate tax for all but the largest estates." },
    ],
  },
  {
    title: "Internal Revenue Code Section 1341 – Claim of Right Doctrine",
    docType: "Act",
    description: "Provides relief when a taxpayer must repay an amount previously included in income based on a claim of right.",
    pages: [
      { pageNum: 1, content: "Under the claim of right doctrine established in North American Oil Consolidated v. Burnet (1932), a taxpayer who receives funds under a claim of right and without restriction on their use must include the funds in income in the year of receipt, even if the taxpayer later becomes obligated to repay them. Section 1341 provides relief when such a repayment occurs. Under Section 1341(a), if a deduction for the repayment would exceed $3,000, the tax for the year of repayment is reduced by the greater of: (1) the tax savings from taking a deduction for the repayment amount in the repayment year; or (2) the decrease in tax that would have resulted in the original inclusion year if the amount had not been included. This provides the taxpayer with a full tax benefit for the repayment, regardless of intervening tax rate changes." },
    ],
  },
  {
    title: "Internal Revenue Code Section 267 – Losses, Expenses, and Interest with Respect to Related Parties",
    docType: "Act",
    description: "Disallows losses on sales between related parties and defers deductions on payments to related cash-basis payors.",
    pages: [
      { pageNum: 1, content: "Section 267(a)(1) disallows any deduction for losses on the sale or exchange of property, directly or indirectly, between related parties. The disallowed loss is not permanently lost — under Section 267(d), the transferee may use it to offset gain on a subsequent disposition of the property. Section 267(a)(2) defers deductions for expenses and interest owed to a related party if the related party is a cash-basis taxpayer who would not include the income until a later taxable year. The deduction is allowed only in the tax year in which the amount is includible in the gross income of the related party." },
      { pageNum: 2, content: "Related Party Definitions: Section 267(b) defines 'related parties' to include: members of the same family (brothers, sisters, spouse, ancestors, and lineal descendants); a corporation and a person who owns directly or indirectly more than 50 percent of the outstanding stock value; two corporations that are members of the same controlled group; a grantor and fiduciary of a trust; fiduciaries and beneficiaries of a trust; and various other relationships. Section 267(c) provides constructive ownership rules — stock owned by a corporation, partnership, estate, or trust is treated as owned proportionately by its shareholders, partners, or beneficiaries for purposes of the more-than-50-percent ownership test." },
    ],
  },
  {
    title: "Internal Revenue Code Section 1245 – Depreciation Recapture for Personal Property",
    docType: "Act",
    description: "Full recapture of depreciation as ordinary income on disposition of depreciable personal property.",
    pages: [
      { pageNum: 1, content: "When depreciable personal property is sold at a gain, Section 1245 requires the gain to be treated as ordinary income to the extent of depreciation (including amortization and other cost recovery deductions) previously allowed or allowable. The recapture applies to MACRS 5-year and 7-year property, intangibles amortized under Section 197, leasehold improvements, and other categories of personal property. The effect is to convert what would otherwise be long-term capital gain into ordinary income taxed at higher rates. For example, if equipment with a $100,000 original cost has been depreciated to a $30,000 basis and is sold for $80,000, the $50,000 gain is entirely ordinary income under Section 1245 because the depreciation taken ($70,000) exceeds the gain ($50,000)." },
    ],
  },
  {
    title: "Internal Revenue Code Section 501(c)(3) – Tax-Exempt Organizations",
    docType: "Act",
    description: "Exempts charitable, religious, and educational organizations from federal income tax and enables tax-deductible contributions.",
    pages: [
      { pageNum: 1, content: "Section 501(c)(3) exempts from federal income tax corporations, community chests, funds, or foundations organized and operated exclusively for religious, charitable, scientific, public safety testing, literary, educational purposes, or for prevention of cruelty to children or animals. No part of net earnings may inure to the benefit of any private shareholder or individual, and the organization may not carry on propaganda or otherwise attempt to influence legislation as a substantial part of its activities. Organizations exempt under Section 501(c)(3) may receive tax-deductible contributions under Section 170. The IRS may revoke exemption if an organization engages in excess benefit transactions under Section 4958, fails to file annual returns, or operates in a manner inconsistent with its exempt purposes." },
    ],
  },
  {
    title: "Internal Revenue Code Section 163 – Interest Expense",
    docType: "Act",
    description: "Allows deduction of interest paid or accrued within the taxable year on indebtedness, subject to numerous limitations.",
    pages: [
      { pageNum: 1, content: "Section 163(a) allows as a deduction all interest paid or accrued within the taxable year on indebtedness. However, numerous limitations apply. For individuals, Section 163(h) generally disallows personal interest — interest on consumer debt — while allowing qualified home mortgage interest on acquisition indebtedness of up to $750,000 ($1 million for pre-December 16, 2017 debt). Section 163(d) limits investment interest deductions to the amount of net investment income for the year; excess investment interest carries forward indefinitely. Section 163(j), substantially expanded by the TCJA, limits business interest expense deductions to 30 percent of adjusted taxable income (ATI), which was originally defined as EBITDA-like income but reduced to EBIT-like income after 2021." },
    ],
  },
  {
    title: "Internal Revenue Code Section 121 – Sale of Principal Residence",
    docType: "Act",
    description: "Excludes from gross income gain on the sale of a taxpayer's principal residence up to $250,000 ($500,000 married).",
    pages: [
      { pageNum: 1, content: "Section 121(a) allows an exclusion from gross income of gain from the sale or exchange of property if the taxpayer has owned and used the property as the taxpayer's principal residence for periods aggregating 2 or more years during the 5-year period ending on the date of the sale or exchange. The exclusion is limited to $250,000 for single filers and $500,000 for married couples filing jointly. A reduced exclusion is available if the sale is due to a change in place of employment, health reasons, or unforeseen circumstances. The Section 121 exclusion may be used repeatedly — there is no minimum time between uses — but may not be used more than once within a two-year period. Gain attributable to depreciation taken after May 6, 1997 (depreciation recapture) is not eligible for the exclusion." },
    ],
  },
  {
    title: "Internal Revenue Code Section 1060 – Special Allocation Rules for Certain Asset Acquisitions",
    docType: "Act",
    description: "Requires residual method allocation of purchase price in applicable asset acquisitions, consistent with IRS reporting.",
    pages: [
      { pageNum: 1, content: "Section 1060 applies to applicable asset acquisitions — direct or indirect transfers of assets constituting a trade or business where the transferee's basis in such assets is determined wholly by reference to the consideration paid. Both parties must allocate the total consideration using the residual method under Section 338(b)(5). Under the residual method, the purchase price is allocated among seven classes of assets: Class I (cash and cash equivalents); Class II (securities, certificates of deposit); Class III (accounts receivable and similar items); Class IV (inventory); Class V (all other assets); Class VI (Section 197 intangibles, excluding goodwill); and Class VII (goodwill and going concern value). Both buyer and seller must file Form 8594 with their tax returns for the year of sale, and any inconsistencies are subject to penalties." },
    ],
  },
  {
    title: "Internal Revenue Code Section 170 – Charitable Contributions Deduction",
    docType: "Act",
    description: "Allows deduction for charitable contributions made to qualifying organizations, subject to AGI limitations.",
    pages: [
      { pageNum: 1, content: "Section 170(a) allows as a deduction any charitable contribution paid within the taxable year. A charitable contribution is a contribution or gift to an organization described in Section 170(c), which includes: federal, state, and local governments for exclusively public purposes; organizations operated exclusively for religious, charitable, scientific, literary, or educational purposes; posts or organizations of war veterans; domestic fraternal societies; and cemetery companies. The deduction is generally limited to: 60 percent of AGI for cash contributions to public charities (the TCJA raised this limit from 50 percent); 30 percent of AGI for contributions of capital gain property; and 20 percent of AGI for contributions to private foundations. Contributions in excess of these limits may be carried forward for up to five years." },
    ],
  },
  {
    title: "Internal Revenue Code Section 368 – Corporate Reorganizations",
    docType: "Act",
    description: "Defines qualifying corporate reorganizations eligible for nonrecognition treatment under Sections 354, 355, and 361.",
    pages: [
      { pageNum: 1, content: "Section 368(a)(1) defines seven types of qualifying reorganizations, commonly designated by their Code subsections as A through G. A Type A reorganization is a statutory merger or consolidation under state or federal law. A Type B reorganization involves the acquisition of stock of one corporation solely in exchange for voting stock of the acquiring corporation, resulting in 80 percent or greater control. A Type C reorganization involves the acquisition of substantially all properties of one corporation in exchange for voting stock. A Type D reorganization involves a transfer of substantially all assets to a controlled corporation. A Type E reorganization is a recapitalization. A Type F reorganization is a mere change in identity, form, or place of organization of one corporation. A Type G reorganization is a transfer of assets in a bankruptcy or receivership proceeding." },
      { pageNum: 2, content: "Judicial Doctrines and Continuity Requirements: In addition to satisfying the statutory definitions, corporate reorganizations must satisfy three judicial requirements: (1) continuity of interest (COI) — the target shareholders must receive a meaningful continuing interest in the acquiring corporation, generally at least 40 percent in stock; (2) continuity of business enterprise (COBE) — the acquiring corporation must either continue the target's historic business or use a significant portion of the target's business assets; and (3) a valid business purpose — the reorganization must be motivated by a genuine business purpose beyond tax avoidance. The step transaction doctrine may cause a series of related transactions to be collapsed into a single transaction, which could cause the combined transaction to fail the statutory requirements." },
    ],
  },
  {
    title: "Internal Revenue Code Section 482 – Allocation of Income Among Related Businesses",
    docType: "Act",
    description: "Grants the IRS authority to reallocate income and deductions between controlled entities to clearly reflect income.",
    pages: [
      { pageNum: 1, content: "Section 482 grants the Secretary the authority to distribute, apportion, or allocate gross income, deductions, credits, or allowances between or among organizations, trades, or businesses owned or controlled by the same interests, whenever necessary to prevent evasion of taxes or to clearly reflect the income of any such organizations, trades, or businesses. The transfer pricing regulations under Section 482 require that transactions between related parties be conducted at arm's length — at prices that would have been agreed to by uncontrolled parties dealing at arm's length in similar circumstances. The standard transfer pricing methods include the comparable uncontrolled price (CUP) method, cost plus method, resale price method, comparable profits method (CPM), and profit split method." },
    ],
  },
  // ── COURT JUDGMENTS (35) ──────────────────────────────────────────────────
  {
    title: "Commissioner v. Glenshaw Glass Co., 348 U.S. 426 (1955)",
    docType: "Court Judgment",
    description: "Supreme Court established the three-part Glenshaw Glass test for gross income: undeniable accession to wealth, clearly realized, over which taxpayer has complete dominion.",
    pages: [
      { pageNum: 1, content: "Commissioner v. Glenshaw Glass Co. (1955) is the landmark Supreme Court case defining the scope of gross income under Section 61 of the Internal Revenue Code. The case arose from punitive damages received by Glenshaw Glass in antitrust litigation with Hartford-Empire Company, and exemplary damages received by William Goldman Theatres in its antitrust suit against Loew's, Inc. The question was whether these punitive and exemplary damages — received in addition to actual damages — constituted taxable gross income. The Tax Court held the amounts were not income; the Third Circuit reversed as to Glenshaw Glass and affirmed as to Goldman Theatres; the Supreme Court granted certiorari to resolve the conflict." },
      { pageNum: 2, content: "The Supreme Court, in an opinion authored by Chief Justice Warren, reversed the Third Circuit and held that punitive damages constitute gross income. Chief Justice Warren stated: 'Here we have instances of undeniable accessions to wealth, clearly realized, and over which the taxpayers have complete dominion.' This three-part formulation — undeniable accession to wealth, clearly realized, complete dominion — became the foundational test for gross income. The Court rejected the argument that 'income' in the Sixteenth Amendment was limited to the gains from labor, capital, or both combined, instead endorsing the broadest reading of 'income from whatever source derived' under Section 22(a) (now Section 61(a))." },
      { pageNum: 3, content: "Significance and Application: The Glenshaw Glass test has been applied across a vast range of fact patterns. Courts have applied the test to hold that taxpayers have income when they: receive punitive damages; obtain cancellation of debt; receive embezzled funds; benefit from economic improvements to property; find treasure troves; receive illegal kickbacks; and obtain above-market bargains in certain circumstances. The test's focus on 'dominion' over the received item addresses the question of whether the taxpayer has truly received the economic benefit. The 'clearly realized' prong distinguishes unrealized appreciation — which is not taxed until a realization event — from income received in a transaction that objectively measures an accession to wealth." },
    ],
  },
  {
    title: "Crane v. Commissioner, 331 U.S. 1 (1947)",
    docType: "Court Judgment",
    description: "Supreme Court held that a taxpayer's basis in mortgaged property includes the full mortgage amount, and amount realized on sale includes outstanding mortgage assumed by buyer.",
    pages: [
      { pageNum: 1, content: "Crane v. Commissioner arose from the inheritance and subsequent sale of an apartment building encumbered by a nonrecourse mortgage equal to the full fair market value of the property. Beulah Crane inherited the property from her husband with an equity value of zero — the property was worth exactly as much as the outstanding mortgage. When she sold the property seven years later, she argued that (1) her basis was zero (the equity value at the time of inheritance), and (2) the amount realized was also zero (the cash she received above the mortgage assumption). The Commissioner argued that the basis should reflect the full fair market value, including the outstanding mortgage, and that the amount realized should similarly include the mortgage assumed by the buyer." },
      { pageNum: 2, content: "The Supreme Court agreed with the Commissioner on both issues. Writing for the majority, Chief Justice Vinson held that property includes the full property, not merely the equity. When a taxpayer acquires mortgaged property, the acquisition price — and thus the basis — includes the full amount of the mortgage, because the taxpayer has taken on an obligation that is part of the economic cost of acquisition. Similarly, when the taxpayer sells or transfers the property and the buyer assumes the mortgage, the amount realized includes the full outstanding mortgage balance, because the taxpayer has been relieved of an obligation. The Court explicitly declined to address whether its holding would apply to nonrecourse mortgages where the mortgage exceeds the value of the property, leaving that question for Tufts." },
      { pageNum: 3, content: "Legacy and the Tufts Extension: The Crane doctrine is the bedrock of tax treatment for mortgaged property. It established that debt secured by property is part of both the taxpayer's investment (basis) and the consideration received on disposition (amount realized). This has profound implications for depreciation — taxpayers can depreciate the full cost of property, including the borrowed portion. In Commissioner v. Tufts (1983), the Supreme Court extended Crane to situations where a nonrecourse mortgage exceeds the property's fair market value, holding that the full outstanding mortgage balance, even if in excess of value, constitutes the amount realized on disposition." },
    ],
  },
  {
    title: "Commissioner v. Banks, 543 U.S. 426 (2005)",
    docType: "Court Judgment",
    description: "Supreme Court held that the portion of a damages award paid to the taxpayer's attorney under a contingency fee arrangement is included in the taxpayer's gross income.",
    pages: [
      { pageNum: 1, content: "Commissioner v. Banks consolidated two cases presenting the same question: whether a taxpayer must include in gross income the portion of a litigation award paid directly to the taxpayer's attorney as a contingency fee. In Banks, the plaintiff had reached a settlement in an employment discrimination case; in Banaitis, the plaintiff settled a banking industry lawsuit. In both cases, the attorneys received their contingency fees directly from the defendants under the settlement agreements. The taxpayers argued that the attorney-fee portion was never in their 'complete dominion' and thus never part of their gross income; they owed tax only on the net recovery." },
      { pageNum: 2, content: "The Supreme Court held unanimously that the full litigation award — including the contingency-fee portion — is included in the taxpayer's gross income. Justice Kennedy's opinion reasoned that under the anticipatory assignment of income doctrine, income is taxed to the one who earns it, not to the one to whom it is paid. When a client assigns a portion of a litigation recovery to an attorney as a fee, the client is assigning a portion of income that would otherwise be the client's to receive. The fact that the fee is paid directly to the attorney does not change the analysis — the client earns the entire recovery and then assigns part of it. The assignment cannot shift the income tax burden from the earner (the client) to the assignee (the attorney)." },
      { pageNum: 3, content: "Congressional Response — Section 62(a)(20): Congress subsequently enacted Section 62(a)(20) to provide relief in employment discrimination cases. Under this provision, attorney fees and court costs paid in connection with discrimination cases are deductible 'above the line' in computing adjusted gross income. This above-the-line deduction prevents the double-taxation problem that otherwise arises from including the full recovery in income while being unable to deduct the attorney fee as a miscellaneous itemized deduction subject to the 2 percent AGI floor. Banks also accelerated the adoption of statutory changes and structured settlements that direct attorney fees outside of gross income." },
    ],
  },
  {
    title: "Cottage Savings Association v. Commissioner, 499 U.S. 554 (1991)",
    docType: "Court Judgment",
    description: "Supreme Court held that the exchange of participation interests in mortgages constituted a 'material difference' triggering realization, even if economically equivalent.",
    pages: [
      { pageNum: 1, content: "Cottage Savings Association v. Commissioner addressed whether an exchange of participation interests in home mortgages resulted in a realization event for purposes of triggering recognition of tax losses. Cottage Savings, a savings and loan institution, held a portfolio of below-market-rate home mortgages. To avoid recognizing losses for regulatory accounting purposes while simultaneously recognizing them for tax purposes, it exchanged pools of participation interests with other savings institutions, retaining a 10 percent interest in each pool. The Commissioner argued no realization event occurred because the exchanged properties were economically equivalent." },
      { pageNum: 2, content: "The Supreme Court, in an opinion by Justice Marshall, held that a realization event occurred. The Court rejected the economic equivalence test urged by the Commissioner and adopted instead a 'material difference' test: whether the properties exchanged are 'materially different' from each other. The Court held that legally distinct entitlements constitute materially different properties — the participation interests exchanged were legally distinct because they were interests in different mortgages on different terms with different obligors, even though their market values were equivalent. Realization does not require economic gain or loss to the taxpayer — it requires only that the taxpayer has exchanged one set of rights for a materially different set of rights." },
    ],
  },
  {
    title: "Hernandez v. Commissioner, 490 U.S. 680 (1989)",
    docType: "Court Judgment",
    description: "Supreme Court held that payments to the Church of Scientology for auditing and training sessions were not deductible charitable contributions.",
    pages: [
      { pageNum: 1, content: "Hernandez v. Commissioner addressed whether payments made by members of the Church of Scientology for 'auditing' sessions and training courses qualified as charitable contributions deductible under Section 170. The payments were made pursuant to a fixed price schedule — each type of session or course had a set price that the Church charged uniformly. The Petitioners argued that the payments were 'charitable contributions' because they were made to a religious organization. The Commissioner argued that the payments were nondeductible quid pro quo transactions because the payors received specific religious benefits in exchange for their payments." },
      { pageNum: 2, content: "The Supreme Court, in an opinion by Justice Marshall, held that the payments were not charitable contributions. Section 170's quid pro quo principle — requiring that contributions be made with donative intent and without expectation of material return benefits — applied to religious benefits as well as to secular benefits. The Court declined to create a special exemption for payments made in exchange for religious services, citing the Establishment Clause concern that creating such an exemption would require the courts to evaluate the worth and nature of religious benefits. The dissenters argued that the Court was penalizing sincere religious practice and that the benefits received (spiritual counseling) were intangible and should not defeat the deduction." },
    ],
  },
  {
    title: "Commissioner v. Tufts, 461 U.S. 300 (1983)",
    docType: "Court Judgment",
    description: "Supreme Court extended Crane v. Commissioner to nonrecourse debt exceeding property value, holding amount realized includes full nonrecourse debt on disposition.",
    pages: [
      { pageNum: 1, content: "Commissioner v. Tufts arose from a partnership that financed construction of an apartment complex with a $1,851,500 nonrecourse mortgage. The partnership later transferred the property, subject to the mortgage, to the lender in satisfaction of the debt. At the time of transfer, the property's fair market value had declined to approximately $1.4 million — significantly less than the outstanding mortgage balance of $1,851,500. The partners claimed that the 'amount realized' on the transfer was limited to the property's fair market value ($1.4 million), resulting in a smaller gain. The Commissioner argued that the full nonrecourse mortgage balance was included in the amount realized." },
      { pageNum: 2, content: "The Supreme Court unanimously held that the full outstanding balance of the nonrecourse mortgage must be included in the amount realized, even when that balance exceeds the fair market value of the property. Justice Blackmun's opinion reasoned that Crane's rationale — that the debt is part of the economic cost of acquisition and thus part of the basis — must be symmetric: if the debt is included in basis on acquisition, the same debt must be included in amount realized on disposition. To hold otherwise would create an asymmetry: the taxpayer would have benefited from depreciation deductions based on the full cost (including the mortgage) but would only recognize gain on disposition based on fair market value." },
    ],
  },
  {
    title: "Welch v. Helvering, 290 U.S. 111 (1933)",
    docType: "Court Judgment",
    description: "Supreme Court defined 'ordinary and necessary' for Section 162 purposes, holding that payments to creditors of former employer to restore business reputation were capital expenditures.",
    pages: [
      { pageNum: 1, content: "Welch v. Helvering is the foundational case defining 'ordinary and necessary' under what is now Section 162 of the Code. Thomas Welch had been an officer of a corporation that went bankrupt, leaving unpaid obligations to customers. After taking a new job as a commission agent for a competing grain company, Welch paid the debts of the bankrupt corporation out of his personal funds to restore his credit and business reputation with the former customers, who were now potential customers for his new employer. He claimed deductions for these payments as ordinary and necessary business expenses." },
      { pageNum: 2, content: "Justice Cardozo, writing for a unanimous Court, held that the payments were not deductible as ordinary and necessary business expenses. While they might be 'necessary' in the sense of appropriate and helpful to Welch's business, they were not 'ordinary' — they were extraordinary, not commonplace or normal. An expense is 'ordinary' if it is common among businesses in the same field. Paying the debts of a bankrupt predecessor for reputational purposes was unusual, not a common business practice. Moreover, Cardozo suggested that the payments were capital expenditures — they created a lasting business asset (goodwill and reputation) — rather than current period expenses." },
    ],
  },
  {
    title: "Old Colony Trust Co. v. Commissioner, 279 U.S. 716 (1929)",
    docType: "Court Judgment",
    description: "Supreme Court held that an employer's payment of an employee's income tax obligation constitutes additional gross income to the employee.",
    pages: [
      { pageNum: 1, content: "Old Colony Trust Co. v. Commissioner established the principle that when an employer pays an employee's income tax obligation, the tax payment itself constitutes additional compensation — and thus gross income — to the employee. The American Woolen Company paid income taxes assessed against its president, Mr. Wood, directly to the government on Wood's behalf, pursuant to board of directors resolutions. Wood argued that the tax payments were gifts or were otherwise not income to him. The Supreme Court, in an opinion by Chief Justice Taft, held unanimously that the tax payments were additional compensation to Wood, required to be included in his gross income." },
    ],
  },
  {
    title: "North American Oil Consolidated v. Burnet, 286 U.S. 417 (1932)",
    docType: "Court Judgment",
    description: "Established the claim of right doctrine: funds received and held under a claim of right are taxable in the year of receipt.",
    pages: [
      { pageNum: 1, content: "North American Oil Consolidated v. Burnet established the 'claim of right doctrine,' one of the foundational timing principles of federal income taxation. The United States asserted that it owned certain oil lands and appointed a receiver to collect income from the property. North American Oil disputed ownership and ultimately prevailed in litigation. The question was: in which year was the income taxable — the year the receiver collected it on behalf of the government, or the year the courts finally resolved the ownership dispute in favor of North American Oil? Justice Brandeis, writing for the Court, held that the income was taxable in the year the receiver turned it over to North American Oil, not in the earlier years of collection." },
      { pageNum: 2, content: "The Claim of Right Rule: Justice Brandeis articulated the rule: 'If a taxpayer receives earnings under a claim of right and without restriction on its disposition, he has received income.' The fact that the taxpayer might later be required to return the amount does not delay taxation — the taxpayer has current use of the funds and is economically richer. If the taxpayer is later required to repay the amount, he may take a deduction in the year of repayment. This doctrine prevents taxpayers from arguing that contested receipts are non-taxable until all controversy is resolved, which could indefinitely defer taxation on contested income. The claim of right doctrine interacts with the tax benefit rule and Section 1341." },
    ],
  },
  {
    title: "Eisner v. Macomber, 252 U.S. 189 (1920)",
    docType: "Court Judgment",
    description: "Supreme Court held that a stock dividend does not constitute taxable income because it represents no accession to the shareholder's wealth.",
    pages: [
      { pageNum: 1, content: "Eisner v. Macomber addressed whether Congress had constitutional authority under the Sixteenth Amendment to tax a stock dividend. Standard Oil of California declared a 50 percent stock dividend; Myrtle Macomber received additional shares equal to 50 percent of her existing shares. The government argued that the stock dividend represented income to the shareholders and was subject to federal income tax. Macomber argued that a stock dividend was merely a division of existing property — a paper transaction — and did not constitute income under the Sixteenth Amendment." },
      { pageNum: 2, content: "The Supreme Court, in a 5-4 decision authored by Justice Pitney, held that the stock dividend was not income subject to federal income tax. The Court adopted a 'realization' requirement for income: a gain must be 'derived from capital, from labor, or from both combined' and must be 'severed' or realized. A stock dividend does not sever any gain from the investment — the shareholder still owns the same proportional interest in the same underlying corporation. The shareholder's wealth has not increased because the corporation's value has simply been divided among more shares. While Eisner's formal realization requirement has been qualified in many respects by subsequent decisions, the core principle — that unrealized appreciation is not taxable — remains foundational." },
    ],
  },
  {
    title: "Helvering v. Horst, 311 U.S. 112 (1940)",
    docType: "Court Judgment",
    description: "Established the anticipatory assignment of income doctrine: income is taxed to the person who earns it, even if assigned to another before receipt.",
    pages: [
      { pageNum: 1, content: "Helvering v. Horst arose from a taxpayer who detached negotiable interest coupons from bonds before their due date and gifted the coupons to his son. The son collected the interest when the coupons matured. The question was whether the interest income was taxable to the father (who earned the right to the interest by owning the bonds) or to the son (who received the actual cash). The Commissioner argued that the father's act of giving away the interest coupons was equivalent to receiving the interest himself and then making a gift of the money — the income should be taxed to the father." },
      { pageNum: 2, content: "The Supreme Court, in an opinion by Justice Stone, held that the interest was taxable to the father. The Court articulated what became known as the 'anticipatory assignment of income' doctrine: the power to dispose of income is the equivalent of ownership; the exercise of that power to procure payment to another is the enjoyment of the income. Income is taxable to the person who earns it — who creates the economic entitlement to it — regardless of who actually receives the cash. The father had 'earned' the interest through his ownership of the bonds; his gift of the right to collect that interest was an anticipatory assignment of income that could not shift the tax burden to his son." },
    ],
  },
  {
    title: "Lucas v. Earl, 281 U.S. 111 (1930)",
    docType: "Court Judgment",
    description: "Established that income must be taxed to the person who earns it, rejecting income-splitting through pre-earning agreements.",
    pages: [
      { pageNum: 1, content: "Lucas v. Earl is the foundational income-splitting case. Guy Earl and his wife entered into a contract providing that all property and income earned by either spouse would be owned jointly. Under California community property law, this arrangement might have allowed them to split Earl's professional income between them for tax purposes. The question was whether Earl could be taxed on only half his salary and fees, with the other half taxable to his wife, based on their contractual arrangement. Justice Holmes, writing for a unanimous Court, held that the income was taxable entirely to Earl." },
      { pageNum: 2, content: "Justice Holmes coined the famous 'fruit and tree' metaphor: 'The fruit must be attributed to the tree upon which it grew.' A taxpayer who earns income cannot assign that income to another person before it is received and thereby shift the tax burden. The contract with Earl's wife was an anticipatory assignment of future earned income — it could determine who owned the income as a matter of contract law, but it could not change who must pay the income tax on it. The income was 'earned' by Earl through his professional services; the assignment of half to his wife did not change that economic reality for tax purposes. Lucas v. Earl establishes that earned income follows the earner." },
    ],
  },
  {
    title: "Burnet v. Logan, 283 U.S. 404 (1931)",
    docType: "Court Judgment",
    description: "Established the open transaction doctrine permitting taxpayers to defer gain recognition on contingent payment sales until basis is recovered.",
    pages: [
      { pageNum: 1, content: "Burnet v. Logan addressed the proper tax treatment of a transaction where the consideration to be received was entirely contingent — making it impossible to determine whether a gain or loss had occurred until all future payments were received. Shareholders of a company received cash plus a contingent right to receive specified amounts per ton of ore extracted from certain mines over an unlimited future period. The Commissioner argued that the contingent payment rights had a determinable fair market value and should be included in the amount realized in the year of sale." },
      { pageNum: 2, content: "The Supreme Court held that the transaction should be treated as 'open' — the taxpayer was entitled to recover her entire basis before recognizing any gain. Because the payments depended on highly speculative future ore extraction, the Commissioner could not determine the value of the contingent right with any reasonable certainty, and therefore the transaction should remain 'open' until all payments were received. Under the open transaction doctrine, each payment is first allocated to recovery of basis; once basis is fully recovered, all further payments are gain. The Installment Sales Revision Act of 1980 and the regulations thereunder significantly limit the application of the open transaction doctrine to cases where the sales price truly cannot be determined." },
    ],
  },
  {
    title: "Arrowsmith v. Commissioner, 344 U.S. 6 (1952)",
    docType: "Court Judgment",
    description: "Established that the character of a loss on a subsequent transaction is determined by the character of the original gain in a related prior transaction.",
    pages: [
      { pageNum: 1, content: "Arrowsmith v. Commissioner addressed a situation where the character of a later loss was linked to the character of an earlier gain. Taxpayers had liquidated a corporation and reported capital gains. Several years later, they were required by a court judgment to pay a portion of those gains to a creditor of the liquidated corporation. They claimed an ordinary loss deduction for the payment. The Commissioner argued that the payment was capital loss because it was related to the capital gain transaction — the liquidation of the corporation." },
      { pageNum: 2, content: "The Supreme Court agreed with the Commissioner and held that the payment was a capital loss. Justice Black reasoned that the relationship between the original capital gain transaction and the subsequent repayment required them to be viewed as parts of the same transaction for character purposes. To allow ordinary loss treatment while the underlying gain was capital would create an unjustified inconsistency. The Arrowsmith doctrine stands for the principle that courts look through time to related transactions to determine the proper character of income or loss — a repayment, judgment, or other consequence of an earlier transaction takes its character from that transaction." },
    ],
  },
  {
    title: "Starker v. United States, 602 F.2d 1341 (9th Cir. 1979)",
    docType: "Court Judgment",
    description: "Ninth Circuit held that a deferred like-kind exchange qualifies under Section 1031 even though the replacement property is not received simultaneously.",
    pages: [
      { pageNum: 1, content: "Starker v. United States addressed whether a 'deferred exchange' — where relinquished property is transferred in one year and replacement property is received in a later year — qualifies as a like-kind exchange under Section 1031. T.J. Starker transferred timberland to Crown Zellerbach Corporation in 1967 and received a contractual right to receive like-kind property in the future. Over the next five years, Crown Zellerbach acquired various properties and transferred them to Starker and his family. The IRS argued that Section 1031 required simultaneous exchange and that the deferred arrangement did not qualify." },
      { pageNum: 2, content: "The Ninth Circuit held that Section 1031 does not require a simultaneous exchange and that the deferred arrangement qualified. The court reasoned that the statute's language — 'exchanged solely for property' — did not specify timing; it focused on the substance of the exchange rather than the form of simultaneous title transfer. The Starker decision prompted Congress to codify the deferred exchange rules in Section 1031(a)(3), enacted in 1984, which established the 45-day identification rule and the 180-day exchange completion rule. These statutory time limits represent Congress's codification of a controlled, but not necessarily simultaneous, deferred like-kind exchange." },
    ],
  },
  {
    title: "Gregory v. Helvering, 293 U.S. 465 (1935)",
    docType: "Court Judgment",
    description: "Established the business purpose doctrine and the step transaction doctrine in the context of a sham corporate reorganization.",
    pages: [
      { pageNum: 1, content: "Gregory v. Helvering is the foundational tax avoidance case, establishing the 'business purpose' doctrine and foreshadowing the 'economic substance' doctrine. Evelyn Gregory owned all the stock of United Mortgage Corporation, which held appreciated shares of Monitor Securities Corporation. To extract the Monitor shares at capital gain rates rather than dividend rates, Gregory created a new corporation, transferred the Monitor shares to it, distributed the new corporation's shares to herself in a 'reorganization,' and then immediately liquidated the new corporation. She reported capital gains rather than ordinary dividend income." },
      { pageNum: 2, content: "The Supreme Court, in an opinion by Justice Sutherland, held that the purported reorganization was a sham lacking any business purpose. While the transaction technically satisfied the literal statutory requirements for a corporate reorganization, it lacked any business purpose beyond tax avoidance. The Court applied a purposive interpretation: Congress intended the reorganization provisions for genuine corporate rearrangements, not for individual shareholders to extract corporate earnings in tax-preferred form. Gregory established that technical compliance with the literal language of a tax provision is insufficient if the transaction lacks the business purpose or economic reality that the provision was intended to cover." },
    ],
  },
  {
    title: "Frank Lyon Co. v. United States, 435 U.S. 561 (1978)",
    docType: "Court Judgment",
    description: "Supreme Court upheld a sale-leaseback transaction as a valid tax shelter, establishing that formal ownership has tax consequences where economic reality supports it.",
    pages: [
      { pageNum: 1, content: "Frank Lyon Co. v. United States addressed the tax consequences of a complex sale-leaseback transaction motivated in part by tax considerations. A bank sold its new office building to Frank Lyon Co. and immediately leased it back under a long-term lease. Lyon claimed depreciation deductions as the owner of the building; the bank claimed rent deductions. The government argued that Lyon was not the true owner — that the bank retained the benefits and burdens of ownership — and that Lyon's deductions should be disallowed." },
      { pageNum: 2, content: "The Supreme Court, in an opinion by Justice Blackmun, upheld the transaction and allowed Lyon's deductions. The Court applied a multi-factor test focusing on economic reality: whether the form of the transaction reflects its substance. The Court identified several factors suggesting Lyon was the true owner: Lyon bore genuine economic risk (it was personally liable on the construction mortgage); the arrangement served legitimate non-tax purposes for the bank (regulatory requirements prevented the bank from owning its building directly); and the transaction was not a sham. Frank Lyon stands for the proposition that tax-motivated transactions are not automatically disregarded, particularly where the form of the transaction reflects economic reality and serves legitimate business purposes." },
    ],
  },
  {
    title: "Helvering v. Davis, 301 U.S. 619 (1937)",
    docType: "Court Judgment",
    description: "Supreme Court upheld the constitutionality of the Social Security Act, including the FICA tax on employers and the old-age benefits program.",
    pages: [
      { pageNum: 1, content: "Helvering v. Davis, decided together with Steward Machine Co. v. Davis, addressed the constitutionality of the Social Security Act of 1935 and its financing mechanism — the Federal Insurance Contributions Act (FICA) tax on both employers and employees. The plaintiff challenged the tax as exceeding Congress's taxing power and as coercing states in violation of the Tenth Amendment. The Court, in an opinion by Justice Cardozo, upheld both the FICA tax and the old-age benefits program. Cardozo reasoned that Congress has broad power under the General Welfare Clause to address national social welfare problems, and that the widespread unemployment and poverty of the Great Depression justified a national old-age benefits system." },
    ],
  },
  {
    title: "Commissioner v. Duberstein, 363 U.S. 278 (1960)",
    docType: "Court Judgment",
    description: "Supreme Court held that whether a transfer is a 'gift' excludable from income is a question of fact focusing on the transferor's donative intent.",
    pages: [
      { pageNum: 1, content: "Commissioner v. Duberstein addressed the question of what constitutes a 'gift' excludable from gross income under Section 102. Duberstein received a Cadillac from Berman, a business acquaintance, as thanks for providing business leads. Duberstein did not report the car as income, claiming it was a gift. The Court held that whether a transfer constitutes a gift is a factual inquiry that turns on the transferor's dominant motive. Justice Brennan articulated the test: 'A gift in the statutory sense proceeds from a detached and disinterested generosity, out of affection, respect, admiration, charity, or like impulses.' Transfers motivated by anticipated economic benefit or recompense for past services are not gifts, even if the transferor characterizes them as such." },
    ],
  },
  {
    title: "Woodsam Associates, Inc. v. Commissioner, 198 F.2d 357 (2d Cir. 1952)",
    docType: "Court Judgment",
    description: "Second Circuit held that a taxpayer who pledges property as security for a nonrecourse loan does not realize income at the time of the loan.",
    pages: [
      { pageNum: 1, content: "Woodsam Associates addressed the question of whether receipt of loan proceeds secured by property constitutes a realization event. A taxpayer pledged appreciated real estate as security for a nonrecourse mortgage loan and received cash. The government argued that the receipt of loan proceeds in excess of basis constituted a taxable disposition of the property. The Second Circuit held that the loan did not constitute a taxable transaction. Borrowing money is not income — it creates an obligation to repay. The taxpayer's basis in the property remains unchanged by the mortgage. The realization event occurs only when the property is actually sold or transferred, at which point the outstanding mortgage is included in the amount realized under Crane." },
    ],
  },
  {
    title: "Knetsch v. United States, 364 U.S. 361 (1960)",
    docType: "Court Judgment",
    description: "Supreme Court held that interest paid on a sham transaction designed solely to generate tax deductions was not deductible.",
    pages: [
      { pageNum: 1, content: "Knetsch v. United States addressed a tax avoidance scheme involving annuity contracts and borrowed funds. Knetsch paid a life insurance company premiums for annuity contracts and simultaneously borrowed nearly the full cash value of the annuities from the same company at a slightly higher interest rate. The net economic result was that Knetsch paid a small premium each year while generating large paper interest deductions. The Supreme Court held that the 'interest' deductions were not allowable because the underlying transaction lacked economic substance — there was no genuine indebtedness, only a circular flow of money designed to produce artificial tax deductions. Knetsch is an early application of the economic substance doctrine in the tax shelter context." },
    ],
  },
  {
    title: "United States v. Lewis, 340 U.S. 590 (1951)",
    docType: "Court Judgment",
    description: "Supreme Court held that under the annual accounting principle, a taxpayer who mistakenly overstates income in Year 1 must deduct the repayment in Year 2, not amend Year 1.",
    pages: [
      { pageNum: 1, content: "United States v. Lewis addressed the tension between the claim of right doctrine and the desire to correct prior-year overpayments. Lewis had included certain bonus income in his Year 1 return under a claim of right. In a later year, he was required to repay a portion of the bonus after an error was discovered. Lewis sought to reopen his Year 1 return to eliminate the overstatement rather than take a deduction in the year of repayment. The Supreme Court held that Lewis must deduct the repayment in the year of repayment, consistent with the annual accounting concept. The claim of right doctrine taxes income when received; the remedy for subsequent repayment is a deduction in the repayment year, not retroactive correction of the year of receipt." },
    ],
  },
  {
    title: "Bob Jones University v. United States, 461 U.S. 574 (1983)",
    docType: "Court Judgment",
    description: "Supreme Court upheld the IRS's revocation of Bob Jones University's tax-exempt status due to racially discriminatory policies.",
    pages: [
      { pageNum: 1, content: "Bob Jones University v. United States addressed whether the IRS could revoke the tax-exempt status of a private religious university that maintained racially discriminatory admissions and conduct policies based on religious beliefs. The IRS had revoked the university's Section 501(c)(3) exemption, reasoning that an organization that violated public policy against racial discrimination could not be 'charitable' in the legal sense. The university argued that the First Amendment's Free Exercise Clause required the IRS to grant exempt status regardless of discriminatory policies, and that Congress had not authorized the IRS to impose nondiscrimination requirements not explicit in the Code." },
      { pageNum: 2, content: "Chief Justice Burger, writing for an 8-1 majority, upheld the IRS's action. The Court held that Congress, in enacting Section 501(c)(3), incorporated the common law meaning of 'charitable' — which requires that an organization not violate established public policy. Racial discrimination in education violated the clearly articulated public policy established by the Supreme Court in Brown v. Board of Education and subsequent civil rights legislation. The government's compelling interest in eradicating racial discrimination in education overrode the university's Free Exercise concerns. Bob Jones establishes that tax exemptions carry implicit requirements of consistency with fundamental public policy, beyond the explicit statutory text." },
    ],
  },
  {
    title: "Cottage Savings Association v. Commissioner – Extension Analysis",
    docType: "Court Judgment",
    description: "Analysis of the realization doctrine and materiality standard following Cottage Savings, applied to financial instrument exchanges.",
    pages: [
      { pageNum: 1, content: "Following Cottage Savings, the courts have applied the 'material difference' realization test broadly to financial instrument exchanges. The test asks whether two properties embody legally distinct entitlements, not whether they are economically equivalent. In practice, this means that: exchanges of interests in different loans (even with the same rates and terms) are realization events; conversions of floating-rate debt to fixed-rate debt are realization events; exchanges of bonds for economically equivalent debt are realization events. Tax practitioners use these principles to engineer recognition of tax losses on financial instrument portfolios without triggering wash sale rules that apply only to stock and securities." },
    ],
  },
  {
    title: "Hillsboro National Bank v. Commissioner, 460 U.S. 370 (1983)",
    docType: "Court Judgment",
    description: "Established the tax benefit rule: events that are fundamentally inconsistent with prior deductions require income recognition.",
    pages: [
      { pageNum: 1, content: "Hillsboro National Bank v. Commissioner addressed the tax benefit rule — the principle that income must be recognized when an event occurs that is fundamentally inconsistent with the premise on which a prior deduction was based. Hillsboro Bank had taken a deduction for taxes paid to the state on behalf of its shareholders. When Illinois repealed the tax and refunded the amounts, the question arose whether the bank must include the refund in income. The Supreme Court applied the tax benefit rule, holding that recovery of a previously deducted amount requires inclusion in income in the year of recovery, to the extent the deduction generated a tax benefit in the prior year." },
    ],
  },
  {
    title: "Pevsner v. Commissioner, 628 F.2d 467 (5th Cir. 1980)",
    docType: "Court Judgment",
    description: "Fifth Circuit disallowed deduction for clothing worn by a store manager, applying the objective test for whether clothing qualifies for the work-related deduction.",
    pages: [
      { pageNum: 1, content: "Pevsner v. Commissioner addressed the deductibility of clothing purchased by a store manager as a business expense. The manager of a Yves Saint Laurent boutique was required by her employer to wear YSL clothing while working. She could not afford such clothing on her salary alone and purchased it primarily for work use. She claimed the clothing as a business expense deduction. The Fifth Circuit held that clothing is deductible only if: (1) the clothing is required as a condition of employment; (2) the clothing is not adaptable to general usage as ordinary clothing; and (3) the clothing is not so worn. The court applied an objective 'ordinary person' test: would the clothing be suitable for general wear? YSL clothing could be worn outside of work, so the deduction was denied regardless of whether the taxpayer actually wore it outside of work." },
    ],
  },
  {
    title: "Moline Properties, Inc. v. Commissioner, 319 U.S. 436 (1943)",
    docType: "Court Judgment",
    description: "Supreme Court established that a corporation has a separate taxable existence that will be respected so long as it engages in business activity.",
    pages: [
      { pageNum: 1, content: "Moline Properties, Inc. v. Commissioner established the foundational principle that a corporation will be recognized as a separate taxable entity distinct from its shareholders, provided it was organized for legitimate business purposes and actually conducts business. The sole shareholder of Moline Properties attempted to disregard the corporate form and report corporate income directly on his personal return. The Supreme Court rejected this approach, holding that the corporation's existence must be recognized for tax purposes because the corporation was formed for a legitimate purpose and conducted real business activity. A corporation cannot be ignored for tax purposes when it is convenient for shareholders to do so." },
    ],
  },
  {
    title: "Byram v. United States, 705 F.2d 1418 (5th Cir. 1983)",
    docType: "Court Judgment",
    description: "Fifth Circuit applied the primary purpose test for determining whether real estate sales constitute dealer vs. investor capital gain treatment.",
    pages: [
      { pageNum: 1, content: "Byram v. United States addressed the distinction between a real estate investor (who receives capital gain treatment on property sales) and a dealer (whose sales produce ordinary income). Byram sold 22 parcels of real estate over four years. The IRS characterized him as a dealer, converting his capital gains to ordinary income. The Fifth Circuit laid out the key factors distinguishing dealers from investors: the nature and purpose of the acquisition; the extent of improvements to the property; the frequency, number, and continuity of sales; the nature and extent of business activities in connection with the property; the proximity of the sale to the acquisition date; the extent of advertising and promotion; the use of a business office for property transactions; and the extent to which the taxpayer held himself out as a dealer." },
    ],
  },
  {
    title: "Fabreeka Products Co. v. Commissioner, 294 F.2d 876 (1st Cir. 1961)",
    docType: "Court Judgment",
    description: "First Circuit applied the business purpose doctrine to disallow deductions on transactions that were structured primarily for tax avoidance.",
    pages: [
      { pageNum: 1, content: "Fabreeka Products Co. v. Commissioner applied the business purpose doctrine to corporate transactions structured to generate tax benefits. A corporation's tax deductions were disallowed because the underlying transactions lacked genuine business purpose. The First Circuit applied Gregory v. Helvering's principle that technical compliance with statutory language is insufficient to sustain deductions when the transactions were not motivated by legitimate business considerations and were structured primarily for tax avoidance. The court emphasized that the economic reality of the transaction, not its formal legal structure, governs tax treatment." },
    ],
  },
  // ── POV / COMMENTARY (20) ──────────────────────────────────────────────────
  {
    title: "POV: Transfer Pricing and the Digital Economy",
    docType: "POV",
    description: "Analysis of transfer pricing challenges in the digital economy, including intangibles, data, and BEPS implications.",
    pages: [
      { pageNum: 1, content: "Transfer pricing — the pricing of transactions between related entities within a multinational enterprise (MNE) — has become one of the most contested areas of international tax law, particularly as the digital economy has transformed how value is created, measured, and allocated. Traditional transfer pricing methods developed in an era of tangible goods and physical services; they struggle to appropriately capture the value creation from digital platforms, user data, algorithms, and network effects that characterize modern digital businesses." },
      { pageNum: 2, content: "The arm's length standard, codified in Section 482 of the Code and Article 9 of the OECD Model Tax Convention, requires that controlled transactions be priced as if the parties were uncontrolled, dealing at arm's length in the open market. Methods include the comparable uncontrolled price (CUP), cost plus, resale price, comparable profits method (CPM), and profit split. In the digital economy, these methods often fail because: comparable uncontrolled transactions do not exist for unique digital goods; costs are a poor proxy for value when marginal costs approach zero; and profit attribution among jurisdictions is ambiguous when the location of value creation is unclear." },
      { pageNum: 3, content: "BEPS (Base Erosion and Profit Shifting) Action Plans: The OECD's BEPS project, launched in 2013, addressed profit shifting through transfer pricing manipulation. BEPS Actions 8-10 focused on aligning profit allocation with value creation, particularly for intangibles (Action 8), risk and capital (Action 9), and high-risk transactions (Action 10). The DEMPE functions (Development, Enhancement, Maintenance, Protection, Exploitation) framework for intangibles requires that profits from intangibles be allocated to the entity that performs or controls the DEMPE functions, rather than simply to the entity that legally holds the intangible. This shift from legal form to economic substance has significantly increased transfer pricing disputes between taxpayers and tax authorities." },
    ],
  },
  {
    title: "POV: Passive Activity Loss Rules – Planning and Compliance",
    docType: "POV",
    description: "Strategic analysis of Section 469 passive activity rules, material participation standards, and real estate professional exception.",
    pages: [
      { pageNum: 1, content: "The passive activity loss (PAL) rules under Section 469, enacted as part of the Tax Reform Act of 1986, were intended to prevent high-income taxpayers from using tax shelter losses to offset ordinary income. Before 1986, tax shelters were pervasive — investors could purchase limited partnership interests in oil and gas, real estate, and other ventures and use partnership losses (often created by accelerated depreciation rather than economic losses) to shelter wage and investment income. Section 469 created a 'passive activity' category for activities in which the taxpayer does not materially participate, and restricted losses from such activities to offsetting only passive income." },
      { pageNum: 2, content: "Material Participation Standards: Treasury Regulation Section 1.469-5T provides seven tests for material participation: (1) the taxpayer participates more than 500 hours during the year; (2) the taxpayer's participation constitutes substantially all participation by all individuals; (3) the taxpayer participates more than 100 hours and at least as much as any other individual; (4) the activity is a significant participation activity (SPA) and aggregate participation in all SPAs exceeds 500 hours; (5) the taxpayer materially participated in any five of the prior ten taxable years; (6) the activity is a personal service activity in which the taxpayer materially participated in any three prior taxable years; or (7) based on all facts and circumstances, the taxpayer participates on a regular, continuous, and substantial basis during the year." },
      { pageNum: 3, content: "Real Estate Professional Exception and Planning: The most significant planning opportunity under Section 469 for real estate investors is the real estate professional exception under Section 469(c)(7). A taxpayer who qualifies as a real estate professional may treat rental real estate losses as non-passive, allowing them to offset wages, investment income, and other ordinary income without limitation. Key qualification requirements: (1) more than 750 hours per year in real property trades or businesses; (2) those real property trade or business hours exceed the time spent in any other trade or business; and (3) the taxpayer must materially participate in each rental activity (or make an aggregation election to treat all rental activities as one activity). The real estate professional exception is one of the most litigated areas in tax law." },
    ],
  },
  {
    title: "POV: Estate Tax Planning – Current Strategies and Techniques",
    docType: "POV",
    description: "Overview of estate tax planning techniques, including GRATs, QPRTs, valuation discounts, and family limited partnerships.",
    pages: [
      { pageNum: 1, content: "Estate tax planning has been transformed by the dramatically increased exemption amounts under the Tax Cuts and Jobs Act of 2017. The basic exclusion amount of $12.92 million per individual (2023) — $25.84 million for married couples — means that fewer than 0.1 percent of decedents' estates owe any federal estate tax. However, the TCJA provisions are scheduled to sunset after December 31, 2025, reverting to approximately $7 million per individual (indexed for inflation), creating urgent planning pressure. The uncertainty creates both risk (failure to plan before sunset) and opportunity (use of current exemption before it is reduced)." },
      { pageNum: 2, content: "Grantor Retained Annuity Trusts (GRATs): A GRAT is an irrevocable trust to which the grantor transfers appreciated assets, retaining an annuity interest for a fixed term. If the transferred assets appreciate at a rate exceeding the Section 7520 hurdle rate during the GRAT term, the excess appreciation passes to remainder beneficiaries (typically children) gift-tax-free. GRATs are particularly effective for volatile, appreciating assets — if the assets decline in value during the GRAT term, the grantor can 'restart' the GRAT. The IRS has challenged GRATs under Section 2702, but standard-structure GRATs have been upheld. The risk is the grantor's death during the GRAT term, which causes estate inclusion." },
      { pageNum: 3, content: "Family Limited Partnerships and Valuation Discounts: Family limited partnerships (FLPs) and family limited liability companies (FLLCs) are commonly used to transfer wealth at discounted values. When a controlling interest in a family business or investment portfolio is transferred to an FLP, and then limited partnership interests are gifted to children, the limited interests may qualify for valuation discounts reflecting lack of control (10-40 percent) and lack of marketability (10-30 percent). The IRS aggressively challenges FLPs under Section 2036 (transfers with retained interests) and Section 2703 (restrictions that lapse), particularly when the FLP holds passive investment assets, there is no legitimate business purpose, and the transferred interests are commingled with personal funds." },
    ],
  },
  {
    title: "POV: FATCA and International Tax Compliance",
    docType: "POV",
    description: "Analysis of the Foreign Account Tax Compliance Act, intergovernmental agreements, and withholding requirements.",
    pages: [
      { pageNum: 1, content: "The Foreign Account Tax Compliance Act (FATCA), enacted in 2010 as part of the Hiring Incentives to Restore Employment (HIRE) Act, fundamentally changed the international tax compliance landscape. FATCA requires U.S. taxpayers to disclose interests in foreign financial assets on Form 8938 and imposes withholding requirements on payments to foreign financial institutions (FFIs) that do not comply with FATCA reporting obligations. The legislation was motivated by the use of offshore accounts to hide taxable income — the UBS scandal revealed that thousands of U.S. taxpayers were concealing assets in Swiss bank accounts." },
      { pageNum: 2, content: "Intergovernmental Agreements (IGAs): The Treasury Department negotiated intergovernmental agreements (IGAs) with over 110 countries to implement FATCA. Model 1 IGAs provide that FFIs in the partner country report information to their domestic tax authority, which then shares the information with the IRS under the exchange of information provisions of an existing tax treaty or tax information exchange agreement. Model 2 IGAs provide that FFIs report directly to the IRS. The U.S.-Switzerland IGA, signed in 2014, marked a watershed in Swiss bank secrecy — Swiss banks now report U.S. accountholder information to Swiss tax authorities for transmission to the IRS." },
    ],
  },
  {
    title: "POV: Corporate Tax Planning – Earnings Stripping and Interest Deductions",
    docType: "POV",
    description: "Analysis of earnings stripping strategies and the Section 163(j) interest limitation enacted by the TCJA.",
    pages: [
      { pageNum: 1, content: "Earnings stripping — the practice of using intercompany debt to shift taxable income from high-tax jurisdictions to low-tax jurisdictions — was one of the primary targets of the TCJA's international tax provisions. Prior to the TCJA, Section 163(j) imposed limited restrictions on earnings stripping, applying only when a U.S. corporation was 'thinly capitalized' (debt-to-equity ratio exceeding 1.5:1) and interest was paid to related foreign persons not subject to full U.S. withholding tax. The TCJA dramatically expanded Section 163(j) to apply broadly to all business interest, regardless of related vs. unrelated parties or domestic vs. cross-border payments." },
      { pageNum: 2, content: "New Section 163(j) Framework: Under the TCJA's Section 163(j), business interest expense deductions are limited to the sum of: (1) business interest income; (2) floor plan financing interest; and (3) 30 percent of adjusted taxable income (ATI). ATI was initially defined as a tax-equivalent of EBITDA (earnings before interest, taxes, depreciation, and amortization), but beginning in 2022, depreciation and amortization are no longer added back, making ATI equivalent to EBIT. This transition significantly reduced the interest limitation for capital-intensive businesses. Disallowed interest expense carries forward indefinitely. Certain businesses are exempt from Section 163(j), including small businesses with average annual gross receipts of $30 million or less." },
    ],
  },
  {
    title: "POV: S Corporation Planning and Elections",
    docType: "POV",
    description: "Guide to S corporation eligibility, advantages, disadvantages, and planning considerations including built-in gains tax.",
    pages: [
      { pageNum: 1, content: "An S corporation is a small business corporation that elects to have income, losses, deductions, and credits flow through directly to shareholders for federal income tax purposes. This pass-through treatment avoids the 'double taxation' on corporate earnings — profits taxed first at the corporate level, then again as dividends at the shareholder level — that applies to C corporations. To qualify for S corporation status, a corporation must: (1) be a domestic corporation; (2) have no more than 100 shareholders; (3) have only one class of stock (though differences in voting rights are permitted); and (4) have only eligible shareholders — individuals, estates, certain trusts, and certain exempt organizations; no nonresident aliens or corporations." },
      { pageNum: 2, content: "Built-In Gains Tax: The built-in gains (BIG) tax under Section 1374 is the most significant potential disadvantage of converting from C corporation to S corporation status. The BIG tax is a corporate-level tax equal to the highest corporate rate (21 percent) applied to 'recognized built-in gain' — gain that accrued economically while the corporation was a C corporation and is recognized during the five-year recognition period following the S election. The tax is designed to prevent C corporations from avoiding the double tax on appreciated assets by converting to S status before disposing of those assets. Net unrealized built-in gain at the time of conversion is the cap on total BIG tax liability." },
    ],
  },
  {
    title: "POV: Qualified Opportunity Zones – Tax Deferral and Exclusion",
    docType: "POV",
    description: "Analysis of the Opportunity Zone program under Sections 1400Z-1 and 1400Z-2, including deferral, basis step-up, and exclusion benefits.",
    pages: [
      { pageNum: 1, content: "The Qualified Opportunity Zone (QOZ) program, enacted by the TCJA as new Sections 1400Z-1 and 1400Z-2, provides three distinct tax incentives for taxpayers who invest capital gains in designated low-income community census tracts. First, a temporary deferral of the original capital gain: gains invested in a Qualified Opportunity Fund (QOF) within 180 days of realization are deferred until the earlier of the date the QOF investment is sold or December 31, 2026. Second, a permanent exclusion of post-investment appreciation: gains accruing within the QOF after the initial investment are permanently excluded from income if the investment is held for at least 10 years. Third, a basis step-up of 10 percent of the deferred gain if the QOF investment is held for five years (the 15 percent step-up for seven-year holding was effectively eliminated by the 2026 recognition date)." },
    ],
  },
  {
    title: "POV: Partnership Taxation – Special Allocations and Substantial Economic Effect",
    docType: "POV",
    description: "Detailed guide to partnership special allocation rules, substantial economic effect, and partnership agreement structuring.",
    pages: [
      { pageNum: 1, content: "Partnership taxation under Subchapter K of the Code provides extraordinary flexibility — partners may agree to allocate income, gain, loss, deduction, and credit among themselves in virtually any manner they choose, provided those allocations have 'substantial economic effect' under Section 704(b) and the Treasury Regulations. This flexibility makes partnerships (and LLCs taxed as partnerships) the preferred entity form for most investment and business ventures where custom economic arrangements are needed. The fundamental principle is that tax allocations should follow economic arrangements." },
      { pageNum: 2, content: "The substantial economic effect test requires satisfying both prongs: economic effect (the allocation must be reflected in the partners' economic rights and obligations) and substantiality (the allocation must not be offset by other allocations that restore the after-tax economic consequences to what they would have been without the special allocation). The economic effect safe harbor requires: (1) maintenance of capital accounts in accordance with Regulation 1.704-1(b)(2)(iv); (2) liquidation of partnership interests in accordance with positive capital account balances; and (3) a deficit restoration obligation (DRO) or qualified income offset (QIO) for allocations that create or increase capital account deficits." },
    ],
  },
  {
    title: "POV: Tax Aspects of Mergers and Acquisitions",
    docType: "POV",
    description: "Overview of tax-free and taxable M&A transactions, including stock vs. asset acquisitions, 338 elections, and Section 368 reorganizations.",
    pages: [
      { pageNum: 1, content: "Tax planning is a central consideration in every merger and acquisition transaction. The fundamental choice between a taxable transaction (typically preferred by buyers for the step-up in asset basis) and a tax-free reorganization (typically preferred by sellers for deferral of gain) shapes deal structure, purchase price, and post-closing integration strategy. In a taxable asset acquisition, the buyer allocates purchase price among assets using the residual method under Section 1060, receiving a cost basis in each asset. The seller recognizes gain or loss on each asset based on the allocation. In a taxable stock acquisition, the buyer takes a cost basis in the stock, while the target's asset bases are unchanged — the buyer inherits the target's embedded liabilities and deferred tax liabilities." },
      { pageNum: 2, content: "Section 338 and 338(h)(10) Elections: To convert a taxable stock acquisition into a deemed asset acquisition, the buyer may make a Section 338 election within 9 months of the acquisition date. The election treats the acquisition as if the target sold all of its assets for the 'aggregate deemed sale price' (ADSP) and immediately repurchased them for the 'adjusted grossed-up basis' (AGUB). The result is a step-up in the target's asset bases to the purchase price allocation. Section 338 results in corporate-level gain recognition. A Section 338(h)(10) election is available for stock purchases of S corporations and for purchases from consolidated groups, allowing the parties to jointly elect deemed asset sale treatment at the corporate level while the shareholder level gain is not also taxed." },
    ],
  },
  {
    title: "POV: Charitable Remainder Trusts and Deferred Giving",
    docType: "POV",
    description: "Tax planning using charitable remainder trusts, charitable lead trusts, and donor-advised funds for blended income and philanthropic goals.",
    pages: [
      { pageNum: 1, content: "Charitable remainder trusts (CRTs) are split-interest trusts that provide income to one or more non-charitable beneficiaries for life or a term of years, with the remainder passing to charity. CRTs offer a combination of tax benefits: an immediate partial charitable deduction (the present value of the charitable remainder interest), avoidance of capital gains tax on contributions of appreciated assets to the CRT (the trust itself is tax-exempt under Section 664), and income spreading over the trust term. There are two primary types: charitable remainder annuity trusts (CRATs), which pay a fixed dollar amount annually, and charitable remainder unitrusts (CRUTs), which pay a fixed percentage of annually-revalued trust assets." },
    ],
  },
  {
    title: "POV: State and Local Tax – Nexus and Apportionment After Wayfair",
    docType: "POV",
    description: "Analysis of state tax implications of South Dakota v. Wayfair for remote sellers, economic nexus standards, and apportionment.",
    pages: [
      { pageNum: 1, content: "South Dakota v. Wayfair, Inc., 585 U.S. 162 (2018), fundamentally changed the landscape of state sales and use tax compliance for remote sellers. The Supreme Court overruled Quill Corp. v. North Dakota's physical presence nexus standard for sales tax purposes, holding that South Dakota's economic nexus threshold — $100,000 in annual sales or 200 separate transactions — does not violate the Commerce Clause. Following Wayfair, all 45 states with a sales tax enacted economic nexus standards for remote sellers, creating significant compliance complexity for businesses selling across state lines." },
      { pageNum: 2, content: "Income Tax Nexus and Apportionment: While Wayfair addressed sales tax, the decision's principles regarding economic presence have accelerated the adoption of economic nexus standards for state income taxes. Most states had already moved to economic nexus through market-based sourcing rules that source service revenues to the state where the customer receives the benefit, rather than where the service is performed. Combined with factor apportionment formulas — typically single-sales factor or weighted toward sales — these changes have created significant complexity in multi-state income tax compliance. The Multistate Tax Commission's (MTC) model apportionment regulations attempt to provide uniformity, but states frequently deviate from the model." },
    ],
  },
  {
    title: "POV: Employee Stock Options – ISO and NQSO Taxation",
    docType: "POV",
    description: "Guide to the tax treatment of incentive stock options and nonqualified stock options for employees and employers.",
    pages: [
      { pageNum: 1, content: "Stock options are a critical component of employee compensation at technology companies and startups. Two types of options have distinct tax profiles: incentive stock options (ISOs) under Section 422 and nonqualified stock options (NQSOs). ISOs offer potentially favorable capital gain treatment to the employee but provide no deduction to the employer. NQSOs generate ordinary income to the employee at exercise (the spread between exercise price and fair market value) and a corresponding employer deduction. For ISOs, no income is recognized at grant or exercise for regular tax purposes, but the spread at exercise is an alternative minimum tax (AMT) preference item under Section 56(b)(3)." },
      { pageNum: 2, content: "Qualifying Disposition Requirements: To receive capital gain treatment on ISO shares, the employee must satisfy two holding period requirements: (1) the shares must be held for at least two years from the date the option was granted; and (2) the shares must be held for at least one year from the date the option was exercised. If either requirement is not met, the disposition is a 'disqualifying disposition' — the employee recognizes ordinary income equal to the spread at exercise (or, if less, the gain on the sale), and the employer receives a corresponding deduction. Planning around the AMT exposure at ISO exercise is a critical consideration, particularly for options with a large spread." },
    ],
  },
  {
    title: "POV: Tax-Exempt Bond Financing",
    docType: "POV",
    description: "Overview of municipal bond tax exemption, arbitrage restrictions, private activity bond requirements, and advance refunding.",
    pages: [
      { pageNum: 1, content: "Tax-exempt bonds issued by state and local governments provide interest income to bondholders that is excluded from federal gross income under Section 103. This federal income tax exemption allows state and local governments to borrow at below-market interest rates — the after-tax yield on a tax-exempt bond can equal the pre-tax yield on a taxable bond, meaning governments effectively share the federal tax savings with bondholders in the form of lower interest rates. For a taxpayer in the 37 percent bracket, a tax-exempt bond yielding 3.5 percent is equivalent to a taxable bond yielding 5.56 percent (3.5% / (1 - 0.37))." },
    ],
  },
  {
    title: "POV: International Tax Planning – GILTI, BEAT, and FDII",
    docType: "POV",
    description: "Analysis of the TCJA's international tax provisions: global intangible low-taxed income, base erosion anti-abuse tax, and foreign-derived intangible income.",
    pages: [
      { pageNum: 1, content: "The Tax Cuts and Jobs Act of 2017 enacted three major new international tax regimes that fundamentally changed the tax analysis for U.S. multinational corporations: Global Intangible Low-Taxed Income (GILTI) under Section 951A, the Base Erosion and Anti-Abuse Tax (BEAT) under Section 59A, and the Foreign-Derived Intangible Income (FDII) deduction under Section 250. Together, these provisions represent the U.S. response to the OECD's BEPS project and the international consensus that intangible income should be taxed where value is created." },
      { pageNum: 2, content: "GILTI Mechanics: GILTI is a deemed dividend from controlled foreign corporations (CFCs) equal to a CFC's net income above a deemed 10 percent return on tangible depreciable assets (the 'routine return'). U.S. corporate shareholders include GILTI in income under Section 951A and may deduct 50 percent of the GILTI inclusion under Section 250 (reduced to 37.5 percent after 2025). The effective tax rate on GILTI is thus approximately 10.5 percent (21 percent corporate rate times 50 percent deduction). Foreign tax credits may be applied against GILTI at 80 percent effectiveness, reducing or eliminating GILTI for CFCs subject to foreign taxes of at least 13.125 percent." },
    ],
  },
  {
    title: "POV: Bankruptcy Tax Consequences",
    docType: "POV",
    description: "Tax consequences of bankruptcy for individuals and corporations, including discharge of indebtedness, tax attribute reduction, and automatic stay.",
    pages: [
      { pageNum: 1, content: "Bankruptcy has significant federal income tax consequences for both debtors and creditors. When a debtor's debt is discharged in bankruptcy, the debtor generally realizes discharge of indebtedness (DOI) income under Section 61(a)(12). However, Section 108(a)(1)(A) provides a complete exclusion from gross income for DOI income that occurs in a Title 11 bankruptcy case. This exclusion applies regardless of the debtor's solvency at the time of discharge. The excluded DOI income is not taxed currently but triggers a reduction in tax attributes under Section 108(b) — the debtor must reduce NOLs, credit carryovers, capital losses, and basis in property by the excluded amount." },
    ],
  },
  {
    title: "POV: Research and Development Tax Credits",
    docType: "POV",
    description: "Analysis of the Section 41 research and experimentation credit, qualified research expenses, and TCJA mandatory capitalization requirement.",
    pages: [
      { pageNum: 1, content: "The research and development (R&D) tax credit under Section 41 provides a tax credit equal to 20 percent of 'qualified research expenses' (QREs) exceeding a base amount calculated using a historical fixed-base percentage. An alternative simplified credit (ASC) of 14 percent of QREs in excess of 50 percent of the average QREs for the prior three years is available. The credit can significantly reduce tax liability for companies investing in product development, process improvement, and software development. QREs include wages for employees engaged in qualified research, supplies used in research, and 65 percent of contract research expenses paid to non-employees." },
    ],
  },
  {
    title: "POV: Cryptocurrency and Digital Asset Taxation",
    docType: "POV",
    description: "Tax treatment of cryptocurrency transactions, including income recognition, capital gain characterization, and reporting requirements.",
    pages: [
      { pageNum: 1, content: "The IRS first issued guidance on the tax treatment of cryptocurrency in Notice 2014-21, holding that virtual currency is treated as property for federal tax purposes. This means that every transaction involving cryptocurrency — including buying goods or services, exchanging one cryptocurrency for another, or receiving cryptocurrency as compensation — is a taxable event requiring the taxpayer to determine the amount realized, the adjusted basis, and the resulting gain or loss. The gain or loss is capital if the cryptocurrency was held as a capital asset, with holding period determining short-term (ordinary rates) versus long-term (preferential) treatment." },
      { pageNum: 2, content: "Mining and Staking Income: Cryptocurrency received through mining or staking is includible in gross income under Section 61 at its fair market value at the time of receipt. This treatment was confirmed in Jarrett v. United States, where the government ultimately agreed to refund taxes paid on staking rewards rather than litigate the issue, though the underlying legal question remains unsettled. Revenue Ruling 2023-14 subsequently held that staking rewards received by a cash-basis taxpayer are includible in gross income in the year received. The TCJA's extension of the wash sale rules (disallowing loss deduction on repurchase within 30 days before or after a sale) does not apply to cryptocurrency, allowing year-end tax-loss harvesting." },
    ],
  },
  {
    title: "POV: Executive Compensation Planning Under 409A and 162(m)",
    docType: "POV",
    description: "Tax planning for non-qualified deferred compensation under Section 409A and the executive pay deduction cap under Section 162(m).",
    pages: [
      { pageNum: 1, content: "Section 409A, enacted in 2004 in response to the Enron collapse's deferred compensation abuses, imposes strict rules on non-qualified deferred compensation (NQDC) arrangements. NQDC is compensation earned in one year but paid in a later year. Under Section 409A, such arrangements must: (1) specify the time and form of payment at the time of deferral (permissible payment triggers include separation from service, disability, death, change in control, a fixed schedule, and unforeseeable emergency); (2) prohibit acceleration of payments; and (3) prohibit subsequent deferrals except in limited circumstances. Violation of Section 409A results in immediate income inclusion of the entire deferred balance plus a 20 percent additional tax and interest." },
    ],
  },
  {
    title: "POV: Tax Considerations in Real Estate Investment Trusts (REITs)",
    docType: "POV",
    description: "Overview of REIT qualification requirements, distribution requirements, and the income and asset tests under Sections 856-860.",
    pages: [
      { pageNum: 1, content: "Real Estate Investment Trusts (REITs) are pass-through entities that invest primarily in real estate assets and are exempt from entity-level federal income tax on income distributed to shareholders, provided they satisfy the requirements of Sections 856 through 860 of the Code. To qualify as a REIT, an entity must: (1) be structured as a corporation, trust, or association; (2) be managed by one or more trustees or directors; (3) have transferable shares; (4) be widely held (100 or more shareholders and not more than 50 percent of shares owned by five or fewer individuals under the 5/50 test); (5) derive at least 75 percent of gross income from real estate sources (the '75 percent income test') and at least 95 percent from real estate plus certain other passive income sources (the '95 percent income test'); (6) hold at least 75 percent of assets in real estate, government securities, and cash; and (7) distribute at least 90 percent of taxable income as dividends." },
    ],
  },
  // ── TAX DOCUMENTS (15) ──────────────────────────────────────────────────────
  {
    title: "IRS Revenue Ruling 99-5: LLC Tax Treatment",
    docType: "Tax Document",
    description: "Addresses the federal income tax treatment of a single-member LLC when a second member joins, converting it to a partnership.",
    pages: [
      { pageNum: 1, content: "Revenue Ruling 99-5 addresses two situations involving the conversion of a single-member LLC (treated as a disregarded entity) into a multi-member LLC (treated as a partnership). Situation 1: A purchases one-half of B's interest in B's SMLLC for cash. Result: (1) B is treated as having sold one-half of each asset of the SMLLC to A for the amount of cash paid; (2) A and B are then treated as having contributed their respective interests in the assets to a newly formed partnership. Situation 2: A contributes cash to B's SMLLC in exchange for a membership interest. Result: (1) B is treated as having contributed all the assets of the SMLLC to a newly formed partnership; and (2) A is then treated as having contributed cash to the partnership in exchange for a membership interest." },
    ],
  },
  {
    title: "IRS Notice 2020-65: Employee Payroll Tax Deferral",
    docType: "Tax Document",
    description: "Implemented President's executive order deferring employee Social Security taxes from September 1 through December 31, 2020.",
    pages: [
      { pageNum: 1, content: "IRS Notice 2020-65, issued August 28, 2020, implemented the President's Memorandum of August 8, 2020, directing the deferral of employee Social Security taxes. The Notice established: (1) a 'deferral period' from September 1, 2020, through December 31, 2020; (2) the deferral applied to applicable wages below $4,000 for any bi-weekly pay period ($8,666 per month); (3) employers were authorized, but not required, to defer withholding and payment of the employee's 6.2 percent Old-Age, Survivors, and Disability Insurance (OASDI) tax; and (4) deferred taxes must be withheld and paid ratably from wages paid in the period January 1 to April 30, 2021, with interest and penalties applying to any amounts not paid by May 1, 2021." },
      { pageNum: 2, content: "Subsequent guidance extended the repayment period through December 31, 2021. The deferral created significant administrative burden for employers — they became liable for the deferred employee taxes regardless of whether they could recover the amounts from employees. Many major employers chose not to implement the deferral due to the administrative complexity and potential uncollectibility from terminated employees. Federal employees and military personnel were subject to mandatory deferral. IRS Notice 2021-11 subsequently extended the period for withholding, depositing, and paying the deferred taxes from April 30, 2021, through December 31, 2021." },
    ],
  },
  {
    title: "Treas. Reg. § 1.199A-1: Qualified Business Income Deduction Regulations",
    docType: "Tax Document",
    description: "Treasury Regulations providing guidance on the Section 199A qualified business income deduction, including relevant rules and definitions.",
    pages: [
      { pageNum: 1, content: "Treas. Reg. § 1.199A-1 provides the foundational definitions and rules for the Section 199A qualified business income (QBI) deduction. Under this regulation, the 'trade or business' standard for Section 199A is determined under Section 162, meaning the activity must rise to the level of a trade or business conducted with continuity and regularity for profit. The regulation addresses how to compute the QBI deduction for taxpayers with multiple qualified trades or businesses, providing that the deduction is computed for each separate trade or business and then aggregated, with the aggregated amount subject to the 20 percent taxable income limitation." },
      { pageNum: 2, content: "Aggregation Rules: Treas. Reg. § 1.199A-4 permits (but does not require) taxpayers to aggregate multiple trades or businesses into a single combined calculation. Aggregation is advantageous when some businesses have high W-2 wages and qualified property and others have high QBI but low wages and property — combining them allows the wage/property limitation to be applied on a blended basis. To aggregate, two or more trades or businesses must: (1) have the same person or group of persons with direct or indirect ownership of 50 percent or more for a majority of the taxable year; (2) none be an SSTB; and (3) satisfy at least two of three integration factors (provision of products or services, shared facilities, or centralized back-office functions)." },
      { pageNum: 3, content: "W-2 Wages Definition: The regulation defines 'W-2 wages' as the total amount of wages subject to wage withholding under Section 3401(a), elective deferrals under Sections 402(g)(3) and 457(e)(11)(A)(ii), and deferred compensation under Section 457(b). Only wages paid with respect to employment in the qualified trade or business are counted. Wages paid by an employer for services performed by a common law employee or a statutory employee are included. Payments to independent contractors are not included in W-2 wages for QBI purposes. Treasury Regulation 1.199A-2 provides three alternative methods for computing W-2 wages: the unmodified box method, modified box 1 method, and tracking wages method." },
    ],
  },
  {
    title: "IRS Revenue Procedure 2000-37: Reverse Like-Kind Exchanges",
    docType: "Tax Document",
    description: "Safe harbor for reverse like-kind exchanges using an Exchange Accommodation Titleholder.",
    pages: [
      { pageNum: 1, content: "Revenue Procedure 2000-37 provides a safe harbor for 'reverse exchanges' — transactions in which the taxpayer acquires replacement property before transferring the relinquished property. The IRS had previously been reluctant to rule on reverse exchanges because property must be 'exchanged' under Section 1031, and the order of exchange in a reverse transaction did not fit the traditional model. Under the safe harbor, the taxpayer may use an Exchange Accommodation Titleholder (EAT) — typically a special purpose entity — to 'park' either the relinquished or replacement property while the exchange is arranged. The EAT takes title to the 'parked' property as a qualified escrow arrangement." },
      { pageNum: 2, content: "Requirements and Limitations: For the safe harbor to apply: (1) the EAT must have a genuinely independent legal identity from the taxpayer; (2) the property must be identified within 45 days of the EAT's acquisition; (3) the exchange must be completed within 180 days of the EAT's acquisition; (4) the combined time for all EAT parking arrangements must not exceed 180 days; and (5) the taxpayer may not have previously used the EAT as an exchange accommodation titleholder more than twice in the prior three years. The Revenue Procedure does not address exchanges outside its safe harbor parameters, leaving open the question of whether other reverse exchange structures qualify under Section 1031." },
    ],
  },
  {
    title: "IRS Notice 2014-21: Virtual Currency Guidance",
    docType: "Tax Document",
    description: "First IRS guidance on the tax treatment of virtual currency, confirming it is treated as property for federal tax purposes.",
    pages: [
      { pageNum: 1, content: "IRS Notice 2014-21, issued March 25, 2014, provided the first comprehensive IRS guidance on the federal income tax treatment of transactions involving convertible virtual currency, such as Bitcoin. The Notice adopted the position that virtual currency is treated as property (not currency) for federal tax purposes, meaning general tax principles applicable to property transactions apply to virtual currency. Accordingly: gain or loss is recognized on every sale or exchange of virtual currency; the character of gain or loss depends on whether the virtual currency is a capital asset in the taxpayer's hands; the fair market value of virtual currency received as payment for goods or services is includible in gross income; and virtual currency received as mining income is includible at its fair market value when received." },
    ],
  },
  {
    title: "IRS Revenue Ruling 2023-14: Staking Reward Taxation",
    docType: "Tax Document",
    description: "Holds that staking rewards received by a cash-basis taxpayer are includible in gross income in the year received.",
    pages: [
      { pageNum: 1, content: "Revenue Ruling 2023-14, issued July 31, 2023, addressed the federal income tax treatment of cryptocurrency staking rewards. The ruling held that a taxpayer who receives new units of cryptocurrency as staking rewards must include the fair market value of the received units in gross income in the taxable year in which the taxpayer receives the units, as determined using the cash receipts and disbursements method of accounting. This ruling resolved a significant area of uncertainty following the Jarrett v. United States case, where the taxpayer argued that staking rewards constitute newly created property (like a sculptor creating a statue) rather than earned income." },
    ],
  },
  {
    title: "IRS Revenue Procedure 2019-38: Safe Harbor for Rental Activities Under 199A",
    docType: "Tax Document",
    description: "Safe harbor treating rental real estate activities as a trade or business for Section 199A purposes if 250 or more hours of rental services are performed annually.",
    pages: [
      { pageNum: 1, content: "Revenue Procedure 2019-38 provides a safe harbor under which a rental real estate enterprise will be treated as a trade or business for purposes of Section 199A. Under the safe harbor, a rental real estate enterprise may treat its rental activity as a qualified trade or business if: (1) separate books and records are maintained for the rental enterprise; (2) the taxpayer performs at least 250 hours of rental services per year with respect to the enterprise; and (3) the taxpayer maintains contemporaneous records of hours of rental services performed, dates, descriptions, and who performed the services. Hours of service include advertising vacancies, negotiating leases, verifying tenant applications, collecting rent, performing daily operational tasks, managing the property, and supervising employees and contractors." },
    ],
  },
  {
    title: "IRS Form 8938 Instructions: Foreign Financial Asset Reporting",
    docType: "Tax Document",
    description: "FATCA reporting requirements for specified foreign financial assets, thresholds, and penalties for noncompliance.",
    pages: [
      { pageNum: 1, content: "Form 8938, Statement of Specified Foreign Financial Assets, must be filed by taxpayers with specified foreign financial assets exceeding certain thresholds: (1) unmarried taxpayers living in the U.S.: $50,000 at year-end or $75,000 at any point during the year; (2) married taxpayers filing jointly living in the U.S.: $100,000 at year-end or $150,000 at any point during the year; (3) taxpayers living abroad: higher thresholds apply ($200,000/$300,000 for single; $400,000/$600,000 for married filing jointly). Specified foreign financial assets include foreign financial accounts, foreign stock or securities not held in a financial account, foreign partnership interests, foreign mutual funds, and foreign annuity or life insurance contracts with investment components." },
    ],
  },
  {
    title: "IRS Revenue Ruling 87-22: Tax Treatment of Points on Home Mortgage",
    docType: "Tax Document",
    description: "Revenue Ruling on the deductibility of points paid on home mortgage loans.",
    pages: [
      { pageNum: 1, content: "Revenue Ruling 87-22 addresses the deductibility of mortgage 'points' — prepaid interest — paid when obtaining a home mortgage loan. Points paid to obtain a mortgage on a principal residence are generally deductible as home mortgage interest in the year paid if: (1) the loan is secured by the taxpayer's principal residence; (2) paying points is an established business practice in the area; (3) the points do not exceed the amount generally charged in that area; (4) the taxpayer uses the cash method of accounting; (5) the points are not paid in lieu of amounts ordinarily stated separately on the settlement statement; and (6) the funds used to pay the points are not borrowed from the lender. Points paid on a refinanced mortgage must generally be amortized over the loan term." },
    ],
  },
  {
    title: "Treasury Regulation 1.469-5T: Material Participation Standards",
    docType: "Tax Document",
    description: "Temporary regulations establishing seven tests for material participation in a passive activity under Section 469.",
    pages: [
      { pageNum: 1, content: "Treas. Reg. Section 1.469-5T provides the seven tests for determining whether a taxpayer materially participates in an activity for purposes of Section 469. Test 1 (500 hours): The taxpayer participates in the activity for more than 500 hours during the taxable year. Test 2 (Substantially all): The taxpayer's participation in the activity for the taxable year constitutes substantially all of the participation in such activity of all individuals for the year, including the participation of individuals who are not owners of interests in the activity. Test 3 (More than 100 hours and not less than any other individual): The taxpayer participates in the activity for more than 100 hours during the taxable year, and such participation is not less than the participation in the activity of any other individual for the year." },
      { pageNum: 2, content: "Additional Tests: Test 4 (Significant participation activities totaling 500 hours): The activity is a significant participation activity for the taxable year and the taxpayer's aggregate participation in all significant participation activities during the year exceeds 500 hours. A significant participation activity is one in which the taxpayer participates between 100 and 500 hours. Test 5 (Material participation in five of the last 10 years): The taxpayer materially participated in the activity for any 5 taxable years (not necessarily consecutive) during the 10 taxable years immediately preceding the taxable year. Test 6 (Personal service activity): The activity is a personal service activity and the taxpayer materially participated in the activity for any 3 taxable years (not necessarily consecutive) preceding the taxable year. Test 7 (Facts and circumstances): Based on all the facts and circumstances, the taxpayer participates in the activity on a regular, continuous, and substantial basis during such year. However, the taxpayer must participate for more than 100 hours for this test to apply." },
    ],
  },
  {
    title: "IRS Notice 2019-51: GILTI High-Tax Exclusion Proposed Regulations",
    docType: "Tax Document",
    description: "IRS Notice describing proposed regulations on the GILTI high-tax exclusion for controlled foreign corporation income subject to high foreign taxes.",
    pages: [
      { pageNum: 1, content: "IRS Notice 2019-51 announced that the Treasury Department and IRS intended to issue proposed regulations providing guidance on the global intangible low-taxed income (GILTI) high-tax exclusion under Section 954(b)(4). The notice described the key features of the proposed regulations: an election to exclude from GILTI certain items of high-taxed income of controlled foreign corporations (CFCs); a unified definition of tested income and qualified business asset investment (QBAI) units; the testing of the effective rate of foreign taxation on a CFC-by-CFC, item-by-item basis using a 18.9 percent threshold (90 percent of the 21 percent corporate rate); and the ability to make the election on an annual basis at the level of each CFC." },
    ],
  },
  {
    title: "IRS Publication 946: How to Depreciate Property",
    docType: "Tax Document",
    description: "IRS guide to MACRS depreciation, bonus depreciation, Section 179 expensing, and depreciation of listed property.",
    pages: [
      { pageNum: 1, content: "IRS Publication 946 provides comprehensive guidance on the depreciation of property for federal income tax purposes. The Modified Accelerated Cost Recovery System (MACRS) is the primary depreciation method for property placed in service after 1986. Under MACRS, property is assigned to a recovery class based on its asset depreciation range (ADR) midpoint life: 3-year property (certain horses, tractor units), 5-year property (computers, automobiles, light trucks), 7-year property (office furniture, equipment without specific recovery period), 10-year property (water transportation equipment), 15-year property (land improvements, certain restaurants and retail establishments), 20-year property (farm buildings, certain utilities), 27.5-year property (residential rental real estate), and 39-year property (nonresidential real property)." },
      { pageNum: 2, content: "Bonus Depreciation and Section 179: The Tax Cuts and Jobs Act expanded bonus depreciation to 100 percent for qualified property placed in service after September 27, 2017, and before January 1, 2023 (phased down to 80 percent in 2023, 60 percent in 2024, 40 percent in 2025, and 20 percent in 2026). The 100 percent bonus depreciation rate was also extended to used property — property not used by the taxpayer or a predecessor in a prior tax year. Section 179 of the Code allows immediate expensing of qualifying property, with a limit of $1,160,000 for 2023 (indexed for inflation). Section 179 property includes most tangible personal property, off-the-shelf computer software, and certain real property improvements (qualified improvement property, roofs, HVAC systems, fire protection, and alarm systems)." },
    ],
  },
  {
    title: "IRS Revenue Ruling 2019-24: Cryptocurrency Hard Fork Income",
    docType: "Tax Document",
    description: "IRS Revenue Ruling addressing when cryptocurrency received from a hard fork or airdrop must be included in gross income.",
    pages: [
      { pageNum: 1, content: "Revenue Ruling 2019-24 addressed two questions regarding the tax treatment of cryptocurrency received through an airdrop and through a hard fork. Question 1: Does a taxpayer have gross income resulting from a hard fork of a cryptocurrency the taxpayer owns if the taxpayer receives no new cryptocurrency? Answer: No. A hard fork that does not result in the taxpayer receiving new cryptocurrency — for example, because the new fork is not distributed to existing holders — does not result in gross income. Question 2: Does a taxpayer have gross income resulting from a hard fork of a cryptocurrency followed by an airdrop of the new currency? Answer: Yes. The taxpayer has ordinary gross income equal to the fair market value of the new cryptocurrency at the time of receipt, if the taxpayer has dominion and control over the cryptocurrency." },
    ],
  },
  {
    title: "IRS Revenue Procedure 2021-45: 2022 Inflation Adjustments",
    docType: "Tax Document",
    description: "Annual IRS guidance providing inflation-adjusted amounts for 2022 tax year, including standard deductions, tax brackets, and credit amounts.",
    pages: [
      { pageNum: 1, content: "Revenue Procedure 2021-45 provides the inflation-adjusted amounts for the 2022 tax year. Key amounts: Standard deduction — $12,950 for single filers, $25,900 for married filing jointly, $19,400 for head of household. Tax brackets — the 37 percent bracket begins at $539,900 for single filers, $647,850 for married filing jointly. Alternative minimum tax exemption — $75,900 for single filers ($538,250 phase-out threshold), $118,100 for married filing jointly ($1,079,800 phase-out threshold). Annual gift tax exclusion — $16,000 per donee (increased from $15,000). Qualified transportation fringe benefit — $280 per month. Contribution limits: 401(k) — $20,500 elective deferrals; IRA — $6,000 ($7,000 if age 50 or older). Section 199A thresholds — $340,100 for married filing jointly, $170,050 for other filers." },
    ],
  },
  {
    title: "IRS Revenue Ruling 2004-86: Taxation of Section 1031 Exchange Facilitators",
    docType: "Tax Document",
    description: "Revenue Ruling on the classification of exchange facilitator fees and the tax treatment of qualified intermediary escrow earnings.",
    pages: [
      { pageNum: 1, content: "Revenue Ruling 2004-86 addresses the federal income tax treatment of amounts earned by a qualified intermediary (QI) holding exchange proceeds during a Section 1031 exchange. The Ruling held that a QI acting as an exchange facilitator in a deferred like-kind exchange is treated, for tax purposes, as an agent of the taxpayer with respect to the exchange proceeds. Consequently, investment income earned by the QI on the exchange proceeds during the exchange period is treated as income to the exchanger (the taxpayer), not to the QI. The ruling rejected the argument that the QI's holding of exchange proceeds constituted a separate economic enterprise generating income to the QI as principal." },
    ],
  },
  // ── 6 ADDITIONAL DOCUMENTS (to reach 100 total) ─────────────────────────
  {
    title: "Commissioner v. Indianapolis Power & Light Co., 493 U.S. 203 (1990)",
    docType: "Court Judgment",
    description: "Supreme Court held that utility customer deposits are not income to the utility because the company lacks complete dominion over the funds.",
    pages: [
      { pageNum: 1, content: "Commissioner v. Indianapolis Power & Light Co. (1990) addressed whether deposits collected by a utility company from customers who lacked satisfactory credit ratings constituted taxable income to the utility in the year of receipt. Indianapolis Power & Light (IPL) required certain customers to make deposits as security; if the customer maintained a good payment record for a period, IPL refunded the deposit with interest. The IRS argued that the deposits were income to IPL upon receipt because IPL had use of the funds." },
      { pageNum: 2, content: "The Supreme Court unanimously held that the deposits were not income to IPL upon receipt because IPL lacked 'complete dominion' over them under the Glenshaw Glass test. Justice Blackmun's opinion emphasized that whether a receipt is income depends on whether it is an 'undeniable accession to wealth' — if the taxpayer has an unconditional obligation to repay, the receipt is a loan, not income. The deposits were more like loans because the customers retained the right to demand repayment and IPL was unconditionally obligated to refund them. The fact that IPL earned interest on the deposits during the holding period did not convert the principal into income." },
    ],
  },
  {
    title: "Burnet v. Sanford & Brooks Co., 282 U.S. 359 (1931)",
    docType: "Court Judgment",
    description: "Supreme Court upheld the annual accounting principle, requiring income and deductions to be reported in the year they arise rather than matching them across years.",
    pages: [
      { pageNum: 1, content: "Burnet v. Sanford & Brooks Co. established the foundational 'annual accounting principle' in federal income taxation. The taxpayer performed dredging operations under a contract and suffered net losses in several years, recovering the amounts in a later year when the government paid additional compensation. The taxpayer argued that the payments in the recovery year should be offset against the prior-year losses, producing no net income. The Supreme Court rejected this approach, holding that each taxable year must be treated as a separate accounting unit. Income must be reported in the year received; deductions must be taken in the year incurred. The fact that later events may change the overall economic result of a transaction does not alter the tax treatment in each year." },
    ],
  },
  {
    title: "United States v. Davis, 370 U.S. 65 (1962)",
    docType: "Court Judgment",
    description: "Supreme Court held that a transfer of appreciated property in settlement of a spouse's marital rights is a taxable exchange, resulting in gain recognition to the transferor.",
    pages: [
      { pageNum: 1, content: "United States v. Davis addressed whether a husband recognized taxable gain when he transferred appreciated stock to his wife in exchange for a release of her marital rights upon divorce. The husband argued the transfer was not a sale or exchange — merely a division of marital property — and therefore no taxable event occurred. The Supreme Court held that the transfer was a taxable exchange: the husband transferred appreciated property and received in return his wife's relinquishment of her marital claims, which were a legal right with ascertainable value. Accordingly, the husband recognized gain equal to the fair market value of the property transferred over his adjusted basis." },
    ],
  },
  {
    title: "POV: Installment Sales Under Section 453",
    docType: "POV",
    description: "Analysis of installment sale reporting, gross profit ratio calculation, interest rules, and dealer installment obligations.",
    pages: [
      { pageNum: 1, content: "Section 453 allows taxpayers who sell property and receive at least one payment after the year of sale to report gain using the installment method — spreading gain recognition across the years in which payments are received. The installment method prevents a liquidity mismatch where a seller owes tax in the year of sale but receives consideration over many future years. The gross profit ratio (GPR) is the fraction of each payment that represents gain: GPR = Gross Profit / Contract Price. Each installment payment received is multiplied by the GPR to determine the gain component; the remainder is return of basis. Interest received on installment obligations is separately reported as ordinary income in the year received." },
      { pageNum: 2, content: "Installment Sale Limitations and Elections: Section 453(i) requires depreciation recapture under Sections 1245 and 1250 to be recognized in full in the year of sale, regardless of installment reporting. This prevents sellers from deferring recapture income on personal property. Section 453A imposes an interest charge on deferred tax from large installment obligations — those in excess of $5 million outstanding at year-end — calculated at the applicable Federal rate. Taxpayers may elect out of installment sale reporting under Section 453(d) and report the full gain in the year of sale, which may be beneficial when the taxpayer has losses to absorb or expects higher future tax rates." },
    ],
  },
  {
    title: "IRS Revenue Ruling 85-13: Grantor Trust Transactions",
    docType: "Tax Document",
    description: "Establishes that transactions between a grantor and a grantor trust are disregarded for federal income tax purposes.",
    pages: [
      { pageNum: 1, content: "Revenue Ruling 85-13 establishes the foundational rule that, for federal income tax purposes, a grantor trust is not treated as an entity separate from its grantor. Transactions between a grantor and a grantor trust — including sales, exchanges, and loans — are disregarded for income tax purposes because the grantor is treated as owning all the trust assets directly. Accordingly: (1) a sale of an asset by a grantor to a grantor trust is not a taxable sale — no gain or loss is recognized; (2) interest paid by the trust to the grantor is not income to the grantor; and (3) the grantor trust does not recognize income on assets it holds. This ruling is the legal foundation for the Intentionally Defective Grantor Trust (IDGT) — an estate planning technique where a grantor sells appreciated assets to the trust in an income-tax-free transaction while removing the assets from the taxable estate." },
    ],
  },
  {
    title: "POV: Controlled Foreign Corporations and Subpart F Income",
    docType: "POV",
    description: "Overview of Subpart F income rules under Sections 951-965, requiring U.S. shareholders to include certain CFC income regardless of distribution.",
    pages: [
      { pageNum: 1, content: "Subpart F income rules under Sections 951 through 965 of the Internal Revenue Code require U.S. shareholders of controlled foreign corporations (CFCs) to currently include their pro rata share of certain categories of CFC income in gross income, regardless of whether the income is actually distributed. A CFC is a foreign corporation in which U.S. shareholders — each owning at least 10 percent of total combined voting power or total value — together own more than 50 percent of the voting power or value. Subpart F income includes: foreign personal holding company income (FPHCI) — passive income such as dividends, interest, rents, and royalties; foreign base company sales income; foreign base company services income; and insurance income. The anti-deferral purpose of Subpart F was to prevent U.S. taxpayers from accumulating passive income offshore without current U.S. taxation." },
      { pageNum: 2, content: "Previously Taxed Income (PTI) and TCJA Changes: Once Subpart F income is included in the U.S. shareholder's income, it becomes 'previously taxed income' (PTI) and may be subsequently distributed to the shareholder without additional U.S. taxation. The TCJA of 2017 expanded the definition of U.S. shareholder to include 10 percent-by-value shareholders and expanded the definition of CFC through changes to constructive ownership rules. The TCJA also enacted Section 965, a transition tax requiring U.S. shareholders to include their pro rata share of accumulated post-1986 deferred foreign income of CFCs — commonly called the 'toll charge' — computed as if the accumulated earnings were distributed on a one-time deemed basis at rates of 15.5 percent (for cash and cash equivalents) and 8 percent (for other assets), payable over 8 years." },
    ],
  },
];

// ── GOLDEN SET (50 entries) ────────────────────────────────────────────────
interface GoldenSeed {
  query: string;
  groundTruthAnswer: string;
  sourceDocument: string;
  pageNumbers: string;
  category: string;
}

const GOLDEN_SET: GoldenSeed[] = [
  {
    query: "What is the standard deduction for married filing jointly under the Tax Cuts and Jobs Act?",
    groundTruthAnswer: "Under the Tax Cuts and Jobs Act of 2017, the standard deduction for married taxpayers filing jointly was increased from $12,700 to $24,000.",
    sourceDocument: "Tax Cuts and Jobs Act of 2017",
    pageNumbers: "2",
    category: "Individual Tax",
  },
  {
    query: "What does IRC Section 61 define as gross income?",
    groundTruthAnswer: "Section 61 defines gross income as 'all income from whatever source derived,' including compensation for services, business income, gains from property, interest, rents, royalties, dividends, and other items. The Supreme Court in Glenshaw Glass articulated gross income as undeniable accessions to wealth, clearly realized, over which the taxpayer has complete dominion.",
    sourceDocument: "Internal Revenue Code Section 61 – Gross Income Defined",
    pageNumbers: "1, 2",
    category: "Income Taxation",
  },
  {
    query: "What are the requirements for a tax-free like-kind exchange under Section 1031?",
    groundTruthAnswer: "Under Section 1031, no gain or loss is recognized when real property held for productive use in a trade or business or for investment is exchanged solely for like-kind real property. After the TCJA, only real property qualifies. The exchange requires a qualified intermediary, compliance with the 45-day identification and 180-day exchange completion periods, and the replacement property must be held for business or investment use.",
    sourceDocument: "Internal Revenue Code Section 1031 – Like-Kind Exchanges",
    pageNumbers: "1, 2, 3, 5",
    category: "Property Transactions",
  },
  {
    query: "What did the Supreme Court decide in Commissioner v. Glenshaw Glass Co.?",
    groundTruthAnswer: "In Commissioner v. Glenshaw Glass Co. (1955), the Supreme Court held that punitive damages and exemplary damages received by a taxpayer constitute gross income subject to federal income taxation. Chief Justice Warren articulated the three-part test for income: undeniable accessions to wealth, clearly realized, and over which the taxpayers have complete dominion.",
    sourceDocument: "Commissioner v. Glenshaw Glass Co., 348 U.S. 426 (1955)",
    pageNumbers: "2, 3",
    category: "Case Law",
  },
  {
    query: "What is the Crane doctrine regarding debt and basis?",
    groundTruthAnswer: "The Crane doctrine, established in Crane v. Commissioner (1947), holds that a taxpayer's basis in mortgaged property includes the full amount of the mortgage debt, even if the mortgage is nonrecourse. The full amount of the mortgage represents the purchase price of the property. On sale, the amount realized includes the outstanding mortgage balance assumed by the buyer.",
    sourceDocument: "Crane v. Commissioner, 331 U.S. 1 (1947)",
    pageNumbers: "2",
    category: "Case Law",
  },
  {
    query: "How does Section 199A define qualified business income?",
    groundTruthAnswer: "QBI is defined as the net amount of qualified items of income, gain, deduction, and loss with respect to any qualified trade or business effectively connected with the conduct of that business within the United States. QBI excludes capital gains, dividends, interest not allocable to a trade or business, and reasonable compensation paid to the taxpayer from the business.",
    sourceDocument: "Internal Revenue Code Section 199A – Qualified Business Income Deduction",
    pageNumbers: "1, 2",
    category: "Pass-Through Taxation",
  },
  {
    query: "What are ordinary and necessary business expenses under IRC Section 162?",
    groundTruthAnswer: "Section 162(a) allows deduction of all ordinary and necessary expenses paid or incurred during the taxable year in carrying on any trade or business, including reasonable compensation, travel expenses while away from home, and rent payments. An expense is 'ordinary' if commonly incurred in that type of business, and 'necessary' if appropriate and helpful to the business.",
    sourceDocument: "Internal Revenue Code Section 162 – Trade or Business Expenses",
    pageNumbers: "1, 2",
    category: "Business Deductions",
  },
  {
    query: "What are the tax consequences when a taxpayer receives attorney fees in a contingency fee arrangement?",
    groundTruthAnswer: "Under Commissioner v. Banks, the portion of a litigation recovery paid to the taxpayer's attorney as a contingency fee is included in the taxpayer's gross income. The full recovery — including the attorney's share — is taxable to the client under the anticipatory assignment of income doctrine.",
    sourceDocument: "Commissioner v. Banks, 543 U.S. 426 (2005)",
    pageNumbers: "2",
    category: "Case Law",
  },
  {
    query: "What is the realization doctrine and the material difference test?",
    groundTruthAnswer: "Under Cottage Savings Association v. Commissioner, a realization event occurs whenever two properties are 'materially different' — meaning they embody legally distinct entitlements. Economic equivalence is irrelevant; legally distinct rights constitute separate properties, and an exchange of such properties triggers realization.",
    sourceDocument: "Cottage Savings Association v. Commissioner, 499 U.S. 554 (1991)",
    pageNumbers: "2",
    category: "Case Law",
  },
  {
    query: "What is the passive activity loss rule under Section 469?",
    groundTruthAnswer: "Section 469 disallows losses from passive activities — activities in which the taxpayer does not materially participate — against non-passive income. Passive activity losses are suspended and carry forward. Material participation requires regular, continuous, and substantial involvement in the activity. Rental activities are generally passive regardless of participation level.",
    sourceDocument: "Internal Revenue Code Section 469 – Passive Activity Loss Rules",
    pageNumbers: "1",
    category: "Passive Activities",
  },
  {
    query: "What is the arm's length standard in transfer pricing?",
    groundTruthAnswer: "The arm's length standard requires that controlled transactions between related entities within a multinational enterprise be priced as if the parties were uncontrolled — dealing at arm's length in an open market. Section 482 grants the IRS authority to reallocate income between related entities to clearly reflect income. Methods include the comparable uncontrolled price (CUP), cost plus, resale price, comparable profits method (CPM), and profit split.",
    sourceDocument: "POV: Transfer Pricing and the Digital Economy",
    pageNumbers: "2",
    category: "International Tax",
  },
  {
    query: "How did the Supreme Court define income in Commissioner v. Glenshaw Glass?",
    groundTruthAnswer: "Chief Justice Warren articulated the governing standard for income: 'Here we have instances of undeniable accessions to wealth, clearly realized, and over which the taxpayers have complete dominion.' This three-part formulation became the foundational test for determining whether any receipt constitutes gross income for federal tax purposes under Section 61.",
    sourceDocument: "Commissioner v. Glenshaw Glass Co., 348 U.S. 426 (1955)",
    pageNumbers: "2",
    category: "Case Law",
  },
  {
    query: "What is a specified service trade or business under Section 199A?",
    groundTruthAnswer: "A specified service trade or business (SSTB) under Section 199A includes: health (physicians, pharmacists, nurses, dentists, etc.), law (attorneys, paralegals, arbitrators), accounting (tax preparation, bookkeeping), actuarial science, performing arts, consulting, athletics, financial services (wealth management, financial planning), and brokerage services. Any trade or business where the principal asset is the reputation or skill of employees or owners is also an SSTB.",
    sourceDocument: "Internal Revenue Code Section 199A – Qualified Business Income Deduction",
    pageNumbers: "3, 4",
    category: "Pass-Through Taxation",
  },
  {
    query: "What are the boot rules in a like-kind exchange?",
    groundTruthAnswer: "Under Section 1031(b), when a taxpayer receives non-like-kind property or cash (called 'boot') in addition to like-kind replacement property, gain is recognized to the extent of boot received. Mortgage relief is treated as boot received but may be offset by new mortgage assumed on the replacement property under the netting rules. A taxpayer who receives boot but has no realized gain will not recognize income.",
    sourceDocument: "Internal Revenue Code Section 1031 – Like-Kind Exchanges",
    pageNumbers: "4",
    category: "Property Transactions",
  },
  {
    query: "How is a single-member LLC treated for federal tax purposes under IRS Revenue Ruling 99-5?",
    groundTruthAnswer: "Under IRS Revenue Ruling 99-5, a single-member LLC (SMLLC) is treated as a disregarded entity for federal tax purposes by default under the check-the-box regulations. Its activities are treated as activities of its single member, as if the member owned the assets directly. When a second member joins the LLC, it automatically becomes a partnership for federal tax purposes.",
    sourceDocument: "IRS Revenue Ruling 99-5: LLC Tax Treatment",
    pageNumbers: "1",
    category: "Entity Classification",
  },
  {
    query: "What was the payroll tax deferral period established by IRS Notice 2020-65?",
    groundTruthAnswer: "IRS Notice 2020-65 established a deferral period for employee Social Security taxes (6.2% OASDI tax) from September 1, 2020, through December 31, 2020, for wages less than $4,000 per biweekly pay period. Employers were required to withhold and pay the deferred taxes ratably from January 1 to April 30, 2021 (later extended to December 31, 2021).",
    sourceDocument: "IRS Notice 2020-65: Employee Payroll Tax Deferral",
    pageNumbers: "1, 2",
    category: "Payroll Tax",
  },
  {
    query: "What trades or businesses are excluded from the Section 199A deduction?",
    groundTruthAnswer: "Specified service trades or businesses (SSTBs) are excluded from the Section 199A QBI deduction for taxpayers above the income thresholds. SSTBs include health, law, accounting, actuarial science, performing arts, consulting, athletics, financial services, and brokerage services. Additionally, the trade or business of performing services as an employee is excluded.",
    sourceDocument: "Internal Revenue Code Section 199A – Qualified Business Income Deduction",
    pageNumbers: "3",
    category: "Pass-Through Taxation",
  },
  {
    query: "What is the annual Section 382 limitation for NOL carryforwards after an ownership change?",
    groundTruthAnswer: "The annual Section 382 limitation equals the fair market value of the loss corporation's stock immediately before the ownership change multiplied by the long-term tax-exempt rate published monthly by the IRS. An ownership change occurs when 5-percent shareholders increase their ownership by more than 50 percentage points during the testing period. NOLs in excess of the annual limitation are permanently lost.",
    sourceDocument: "Internal Revenue Code Section 382 – NOL Limitations After Ownership Change",
    pageNumbers: "1, 2",
    category: "Corporate Tax",
  },
  {
    query: "What is the business purpose doctrine established in Gregory v. Helvering?",
    groundTruthAnswer: "Gregory v. Helvering established that technical compliance with tax statutes is insufficient when the transaction lacks the business purpose that the statute was intended to cover. The Court held that a purported corporate reorganization used solely to extract corporate earnings at capital gain rates rather than dividend rates was a sham lacking any genuine corporate business purpose, and thus did not qualify for reorganization treatment.",
    sourceDocument: "Gregory v. Helvering, 293 U.S. 465 (1935)",
    pageNumbers: "2",
    category: "Case Law",
  },
  {
    query: "What is the Net Investment Income Tax under Section 1411?",
    groundTruthAnswer: "Section 1411 imposes a 3.8 percent tax on the lesser of net investment income or the excess of modified adjusted gross income over threshold amounts ($200,000 single; $250,000 married filing jointly). Net investment income includes interest, dividends, annuities, royalties, rents, and net capital gains, as well as all passive activity income including rental income of non-real-estate professionals.",
    sourceDocument: "Internal Revenue Code Section 1411 – Net Investment Income Tax",
    pageNumbers: "1",
    category: "Investment Tax",
  },
  {
    query: "How does the Tufts decision extend the Crane doctrine?",
    groundTruthAnswer: "Commissioner v. Tufts extended Crane v. Commissioner to situations where a nonrecourse mortgage exceeds the fair market value of the property. The Supreme Court held that the full outstanding balance of the nonrecourse mortgage — even if greater than the property's fair market value — must be included in the amount realized upon disposition. This ensures symmetry: the mortgage was included in basis on acquisition, so it must be included in amount realized on disposition.",
    sourceDocument: "Commissioner v. Tufts, 461 U.S. 300 (1983)",
    pageNumbers: "2",
    category: "Case Law",
  },
  {
    query: "What is the anticipatory assignment of income doctrine?",
    groundTruthAnswer: "The anticipatory assignment of income doctrine, established in Helvering v. Horst and Lucas v. Earl, holds that income must be taxed to the person who earns it, even if that person assigns the right to receive the income to another before it is received. The power to dispose of income is the equivalent of ownership of that income for tax purposes.",
    sourceDocument: "Helvering v. Horst, 311 U.S. 112 (1940)",
    pageNumbers: "2",
    category: "Case Law",
  },
  {
    query: "What is the claim of right doctrine?",
    groundTruthAnswer: "The claim of right doctrine, established in North American Oil Consolidated v. Burnet, provides that a taxpayer who receives funds under a claim of right and without restriction on their use must include the funds in income in the year of receipt, even if the taxpayer may later be required to repay them. Section 1341 provides relief when the taxpayer must repay amounts previously included in income.",
    sourceDocument: "North American Oil Consolidated v. Burnet, 286 U.S. 417 (1932)",
    pageNumbers: "2",
    category: "Case Law",
  },
  {
    query: "What is the exclusion for gain on sale of principal residence under Section 121?",
    groundTruthAnswer: "Section 121 allows an exclusion of up to $250,000 of gain ($500,000 for married filing jointly) on the sale of a taxpayer's principal residence. The taxpayer must have owned and used the property as a principal residence for at least 2 of the 5 years before the sale. The exclusion may be used repeatedly but not more than once every two years.",
    sourceDocument: "Internal Revenue Code Section 121 – Sale of Principal Residence",
    pageNumbers: "1",
    category: "Real Property",
  },
  {
    query: "What are GRATs and how are they used in estate planning?",
    groundTruthAnswer: "A Grantor Retained Annuity Trust (GRAT) is an irrevocable trust to which the grantor transfers appreciated assets and retains an annuity for a fixed term. If assets appreciate faster than the Section 7520 hurdle rate, the excess appreciation passes to beneficiaries gift-tax-free. GRATs are particularly effective for volatile, appreciating assets and can be restarted if assets decline in value during the term.",
    sourceDocument: "POV: Estate Tax Planning – Current Strategies and Techniques",
    pageNumbers: "2",
    category: "Estate Planning",
  },
  {
    query: "What did Welch v. Helvering establish about ordinary business expenses?",
    groundTruthAnswer: "Welch v. Helvering established that 'ordinary' for purposes of Section 162 means common or frequent in the business setting — not merely appropriate or helpful to the taxpayer. Justice Cardozo held that paying the debts of a bankrupt predecessor to restore business reputation was not ordinary because it was extraordinary and unusual, not a common business practice. Such payments were capital expenditures rather than current deductions.",
    sourceDocument: "Welch v. Helvering, 290 U.S. 111 (1933)",
    pageNumbers: "2",
    category: "Business Deductions",
  },
  {
    query: "What is the Section 338(h)(10) election in an M&A transaction?",
    groundTruthAnswer: "A Section 338(h)(10) election allows a buyer and seller to jointly elect that a stock purchase of an S corporation or a subsidiary in a consolidated group be treated as a deemed asset sale. The target is treated as selling all its assets and immediately repurchasing them at fair market value, creating a stepped-up basis in the assets for the buyer without triggering shareholder-level gain separately.",
    sourceDocument: "POV: Tax Aspects of Mergers and Acquisitions",
    pageNumbers: "2",
    category: "Corporate Tax",
  },
  {
    query: "What are the seven tests for material participation under Treasury Regulation 1.469-5T?",
    groundTruthAnswer: "The seven tests are: (1) participation exceeds 500 hours; (2) participation constitutes substantially all participation in the activity; (3) participation exceeds 100 hours and is not less than any other individual's; (4) the activity is a significant participation activity (100-500 hours) and aggregate SPA hours exceed 500; (5) material participation in 5 of the prior 10 years; (6) it is a personal service activity with material participation in any 3 prior years; and (7) facts and circumstances show regular, continuous, and substantial participation exceeding 100 hours.",
    sourceDocument: "Treasury Regulation 1.469-5T: Material Participation Standards",
    pageNumbers: "1, 2",
    category: "Passive Activities",
  },
  {
    query: "How does FATCA affect foreign financial institutions and U.S. taxpayers?",
    groundTruthAnswer: "FATCA requires U.S. taxpayers with foreign financial assets exceeding reporting thresholds to file Form 8938. Foreign financial institutions (FFIs) that do not comply with FATCA reporting requirements are subject to a 30 percent withholding tax on U.S.-source payments. The Treasury has negotiated intergovernmental agreements (IGAs) with over 110 countries to implement FATCA through local tax authorities.",
    sourceDocument: "POV: FATCA and International Tax Compliance",
    pageNumbers: "1, 2",
    category: "International Tax",
  },
  {
    query: "What is GILTI and how is it taxed for U.S. corporations?",
    groundTruthAnswer: "GILTI (Global Intangible Low-Taxed Income) is a deemed dividend from controlled foreign corporations equal to a CFC's net income above a deemed 10 percent return on tangible depreciable assets. U.S. corporations include GILTI in income and may deduct 50 percent under Section 250, resulting in an effective rate of approximately 10.5 percent. Foreign tax credits offset GILTI at 80 percent effectiveness.",
    sourceDocument: "POV: International Tax Planning – GILTI, BEAT, and FDII",
    pageNumbers: "2",
    category: "International Tax",
  },
  {
    query: "What is the Section 1014 stepped-up basis rule for inherited property?",
    groundTruthAnswer: "Section 1014 provides that the basis of property acquired from a decedent is generally the fair market value of the property at the date of the decedent's death. This 'stepped-up basis' eliminates unrealized appreciation that occurred during the decedent's lifetime. The rule does not apply to income in respect of a decedent (IRD) items, which retain their pre-death income tax character.",
    sourceDocument: "Internal Revenue Code Section 1014 – Basis of Property Acquired from a Decedent",
    pageNumbers: "1, 2",
    category: "Property Transactions",
  },
  {
    query: "What is the corporate tax rate under the Tax Cuts and Jobs Act?",
    groundTruthAnswer: "The TCJA established a flat corporate income tax rate of 21 percent, effective for taxable years beginning after December 31, 2017. This replaced the prior graduated corporate rate structure with a maximum marginal rate of 35 percent. The corporate alternative minimum tax was also repealed.",
    sourceDocument: "Tax Cuts and Jobs Act of 2017",
    pageNumbers: "3",
    category: "Corporate Tax",
  },
  {
    query: "What is the Starker case and deferred like-kind exchanges?",
    groundTruthAnswer: "Starker v. United States (9th Cir. 1979) established that a deferred like-kind exchange — where replacement property is received in a later tax year than the relinquished property is transferred — qualifies under Section 1031. The Ninth Circuit held that simultaneous exchange is not required. Congress subsequently codified the deferred exchange rules with the 45-day identification and 180-day completion requirements.",
    sourceDocument: "Starker v. United States, 602 F.2d 1341 (9th Cir. 1979)",
    pageNumbers: "2",
    category: "Property Transactions",
  },
  {
    query: "What types of corporate reorganizations are defined under Section 368?",
    groundTruthAnswer: "Section 368 defines seven types of tax-free corporate reorganizations: Type A (statutory merger or consolidation), Type B (stock-for-stock acquisition resulting in 80% control), Type C (acquisition of substantially all assets for voting stock), Type D (transfer of assets to controlled corporation), Type E (recapitalization), Type F (change in identity, form, or place of organization), and Type G (transfer in bankruptcy). All must satisfy continuity of interest, continuity of business enterprise, and business purpose requirements.",
    sourceDocument: "Internal Revenue Code Section 368 – Corporate Reorganizations",
    pageNumbers: "1, 2",
    category: "Corporate Tax",
  },
  {
    query: "How is virtual currency treated for federal income tax purposes under IRS Notice 2014-21?",
    groundTruthAnswer: "Under IRS Notice 2014-21, virtual currency (such as Bitcoin) is treated as property for federal tax purposes, not currency. Every transaction involving virtual currency is a taxable event requiring computation of gain or loss. Mining income is includible at fair market value when received. The character of gain depends on whether the virtual currency is a capital asset.",
    sourceDocument: "IRS Notice 2014-21: Virtual Currency Guidance",
    pageNumbers: "1",
    category: "Digital Assets",
  },
  {
    query: "What is the Section 469 real estate professional exception?",
    groundTruthAnswer: "A taxpayer qualifies as a real estate professional under Section 469(c)(7) if: (1) more than 50 percent of personal services are in real property trades or businesses in which the taxpayer materially participates; and (2) the taxpayer performs more than 750 hours of services in those trades or businesses. Real estate professionals may deduct rental real estate losses as non-passive losses against any income.",
    sourceDocument: "POV: Passive Activity Loss Rules – Planning and Compliance",
    pageNumbers: "3",
    category: "Real Property",
  },
  {
    query: "What is depreciation recapture under Section 1245?",
    groundTruthAnswer: "Section 1245 requires that when depreciable personal property is sold at a gain, the gain is treated as ordinary income to the extent of depreciation previously allowed or allowable. This recapture applies to all personal property subject to depreciation and converts capital gain into ordinary income. For example, if equipment is depreciated from $100,000 to $30,000 and sold for $80,000, the entire $50,000 gain is ordinary income.",
    sourceDocument: "Internal Revenue Code Section 1245 – Depreciation Recapture",
    pageNumbers: "1",
    category: "Property Transactions",
  },
  {
    query: "What is the check-the-box entity classification regulation?",
    groundTruthAnswer: "The check-the-box regulations under Treas. Reg. 301.7701-3 allow eligible business entities to elect their federal tax classification. A domestic entity with two or more members defaults to partnership; a single-member entity defaults to a disregarded entity. Entities may elect alternative classifications by filing Form 8832. Certain entities are per se corporations and cannot elect different classification.",
    sourceDocument: "Internal Revenue Code Section 7701 – Definitions",
    pageNumbers: "2",
    category: "Entity Classification",
  },
  {
    query: "What did Old Colony Trust Co. v. Commissioner establish about employer-paid taxes?",
    groundTruthAnswer: "Old Colony Trust Co. v. Commissioner established that when an employer pays an employee's income tax obligation on behalf of the employee, the tax payment constitutes additional compensation and is includible in the employee's gross income. The employee cannot exclude the employer-paid taxes from income simply because they were paid directly to the government.",
    sourceDocument: "Old Colony Trust Co. v. Commissioner, 279 U.S. 716 (1929)",
    pageNumbers: "1",
    category: "Case Law",
  },
  {
    query: "What is the Section 351 control requirement for tax-free incorporation?",
    groundTruthAnswer: "Section 351 provides nonrecognition treatment when property is transferred to a corporation in exchange for stock, if immediately after the exchange, the transferors as a group control at least 80 percent of total combined voting power and 80 percent of total shares of all other classes of stock. Control is measured immediately after the exchange and includes all parties who transferred property in the same transaction.",
    sourceDocument: "Internal Revenue Code Section 351 – Transfers to Corporations",
    pageNumbers: "1, 2",
    category: "Corporate Tax",
  },
  {
    query: "How are S corporation built-in gains taxed?",
    groundTruthAnswer: "Section 1374 imposes a corporate-level built-in gains (BIG) tax on S corporations that converted from C corporation status. The BIG tax equals the highest corporate rate (21 percent) applied to recognized built-in gains — gains that accrued economically while the corporation was a C corporation — recognized during the five-year recognition period following the S election. The net unrealized built-in gain at conversion is the cap on total BIG tax.",
    sourceDocument: "POV: S Corporation Planning and Elections",
    pageNumbers: "2",
    category: "Pass-Through Taxation",
  },
  {
    query: "What is the Qualified Opportunity Zone program?",
    groundTruthAnswer: "The Qualified Opportunity Zone program under Sections 1400Z-1 and 1400Z-2 provides three benefits for investors who invest capital gains in Qualified Opportunity Funds: (1) temporary deferral of the original capital gain until December 31, 2026, or earlier sale; (2) a 10 percent basis step-up on the deferred gain if the investment is held 5 years; and (3) permanent exclusion of post-investment appreciation if held at least 10 years.",
    sourceDocument: "POV: Qualified Opportunity Zones – Tax Deferral and Exclusion",
    pageNumbers: "1",
    category: "Investment Tax",
  },
  {
    query: "What is the annual gift tax exclusion and unified credit for estate planning?",
    groundTruthAnswer: "The annual gift tax exclusion is $16,000 per donee for 2022 ($17,000 for 2023), allowing gifts to unlimited recipients without using the lifetime exemption. The unified credit (basic exclusion amount) is $12,920,000 per individual for 2023, providing a combined estate and gift tax exemption of approximately $25.84 million for married couples. The TCJA exemption amounts are scheduled to sunset after 2025.",
    sourceDocument: "Internal Revenue Code Section 2001 – Imposition and Rate of Estate Tax",
    pageNumbers: "1",
    category: "Estate Planning",
  },
  {
    query: "What are the 45-day and 180-day rules for deferred like-kind exchanges?",
    groundTruthAnswer: "Under Section 1031(a)(3), in a deferred like-kind exchange, the taxpayer must: (1) identify the replacement property within 45 days of transferring the relinquished property (the 45-day rule); and (2) receive the replacement property within 180 days of the transfer or the due date of the return (including extensions) for the year of transfer, whichever is earlier (the 180-day rule).",
    sourceDocument: "Internal Revenue Code Section 1031 – Like-Kind Exchanges",
    pageNumbers: "3",
    category: "Property Transactions",
  },
  {
    query: "What is the Section 163(j) business interest limitation enacted by the TCJA?",
    groundTruthAnswer: "Section 163(j) limits business interest expense deductions to the sum of business interest income, floor plan financing interest, and 30 percent of adjusted taxable income (ATI). ATI was defined as EBITDA through 2021 but reduced to EBIT thereafter, increasing the limitation for capital-intensive businesses. Disallowed interest carries forward indefinitely. Small businesses with $30 million or less in gross receipts are exempt.",
    sourceDocument: "POV: Corporate Tax Planning – Earnings Stripping and Interest Deductions",
    pageNumbers: "2",
    category: "Corporate Tax",
  },
  {
    query: "What is the IRS safe harbor for rental real estate under Section 199A?",
    groundTruthAnswer: "Under Revenue Procedure 2019-38, a rental real estate enterprise qualifies as a trade or business for Section 199A purposes if: (1) separate books and records are maintained; (2) at least 250 hours of rental services are performed annually; and (3) contemporaneous records of hours, dates, descriptions, and performers of services are maintained.",
    sourceDocument: "IRS Revenue Procedure 2019-38: Safe Harbor for Rental Activities Under 199A",
    pageNumbers: "1",
    category: "Pass-Through Taxation",
  },
  {
    query: "What is the unrecaptured Section 1250 gain and how is it taxed?",
    groundTruthAnswer: "Unrecaptured Section 1250 gain is the straight-line depreciation taken on real property that is subject to a maximum 25 percent tax rate when the property is sold, rather than the 0/15/20 percent long-term capital gain rates. This rule effectively implements partial recapture of depreciation taken on real estate without requiring it to be treated as ordinary income under Section 1250.",
    sourceDocument: "Internal Revenue Code Section 1245 – Depreciation Recapture for Personal Property",
    pageNumbers: "1",
    category: "Property Transactions",
  },
  {
    query: "How are staking rewards treated for federal income tax purposes after Revenue Ruling 2023-14?",
    groundTruthAnswer: "Under Revenue Ruling 2023-14, cryptocurrency received as staking rewards must be included in gross income at fair market value in the taxable year received, under the cash receipts and disbursements method. This is consistent with the broader property treatment of cryptocurrency established in IRS Notice 2014-21.",
    sourceDocument: "IRS Revenue Ruling 2023-14: Staking Reward Taxation",
    pageNumbers: "1",
    category: "Digital Assets",
  },
  {
    query: "What is the MACRS depreciation system and its recovery periods?",
    groundTruthAnswer: "MACRS (Modified Accelerated Cost Recovery System) is the primary depreciation method for property placed in service after 1986. Recovery periods include: 3-year (horses, tractor units), 5-year (computers, automobiles), 7-year (office furniture and equipment), 15-year (land improvements), 27.5-year (residential rental real estate), and 39-year (nonresidential real property). The TCJA provided 100 percent bonus depreciation for 2018-2022, phased down thereafter.",
    sourceDocument: "IRS Publication 946: How to Depreciate Property",
    pageNumbers: "1, 2",
    category: "Property Transactions",
  },
  {
    query: "What is the Arrowsmith doctrine and how does it affect tax character?",
    groundTruthAnswer: "The Arrowsmith doctrine holds that the character of a loss on a subsequent transaction is determined by the character of the original gain in a related prior transaction. In Arrowsmith v. Commissioner, a payment made years after a corporate liquidation was treated as capital loss (not ordinary loss) because the underlying transaction that gave rise to the obligation was a capital gain transaction.",
    sourceDocument: "Arrowsmith v. Commissioner, 344 U.S. 6 (1952)",
    pageNumbers: "2",
    category: "Case Law",
  },
];

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select().from(legalDocumentsTable).limit(1);
  const targetCount = DOCUMENTS.length;

  if (existing.length > 0) {
    const allDocs = await db.select().from(legalDocumentsTable);
    if (allDocs.length === targetCount) {
      logger.info("Database already seeded — skipping");
      return;
    }
    logger.info({ existing: allDocs.length, target: targetCount }, "Document count mismatch — reseeding");
    await db.delete(legalDocumentsTable);
    await db.delete(goldenSetEntriesTable);
  }

  logger.info({ count: DOCUMENTS.length }, "Seeding legal documents");

  for (const doc of DOCUMENTS) {
    const [inserted] = await db
      .insert(legalDocumentsTable)
      .values({
        title: doc.title,
        docType: doc.docType,
        description: doc.description,
        pageCount: doc.pages.length,
      })
      .returning({ id: legalDocumentsTable.id });

    if (!inserted) continue;

    const chunks = doc.pages.map((p) => ({
      documentId: inserted.id,
      pageNum: p.pageNum,
      content: p.content,
      tokenCount: Math.ceil(p.content.length / 4),
    }));

    await db.insert(documentChunksTable).values(chunks);
  }

  logger.info({ count: GOLDEN_SET.length }, "Seeding golden set entries");

  const goldenRows = GOLDEN_SET.map((g) => ({
    query: g.query,
    groundTruthAnswer: g.groundTruthAnswer,
    sourceDocument: g.sourceDocument,
    pageNumbers: g.pageNumbers,
    category: g.category,
  }));
  await db.insert(goldenSetEntriesTable).values(goldenRows);

  logger.info("Seeding complete");
}
