export function classifyRole(enriched) {
  const contact = enriched?.contact;

  // 1. No profile or company → personal email
  if (!contact?.profile || !contact?.profile?.position?.company) {
    return {
      decision_maker: false,
      confidence: "Low",
      category: "Unqualified",
      reason: "Personal email or no verifiable company data",
      suggested_action: "Skip outbound or find work email via LinkedIn",
    };
  }

  const title = contact.profile.position.title?.toLowerCase() || "";

  const seniorKeywords = [
    "founder",
    "co-founder",
    "ceo",
    "chief",
    "vp",
    "vice president",
    "director",
    "head",
    "associate director",
  ];

  const isDecisionMaker = seniorKeywords.some((k) => title.includes(k));

  return {
    decision_maker: isDecisionMaker,
    confidence: isDecisionMaker ? "High" : "Medium",
    category: isDecisionMaker ? "Decision Maker" : "Influencer",
    title: contact.profile.position.title,
    company: contact.profile.position.company.name,
    reason: isDecisionMaker
      ? "Senior leadership role with buying authority"
      : "Mid-level role with influence but limited authority",
  };
}
