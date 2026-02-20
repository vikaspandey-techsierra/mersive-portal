const states = ["UP", "MH", "RJ", "DL", "KA", "TN", "AP", "WB", "GJ", "HR", "PB", "MP", "CG", "OR", "BR", "AS", "NE", "JH", "UT", "HP", "JK", "TR", "AR", "ML", "MZ", "SK", "AN", "LD", "CH", "DN", "DD", "PY", "GA", "KL", "LA", "MN", "NL", "PY", "SK", "TG", "TS", "UK", "WB", ];
const ageGroups = ["18-25", "26-40", "41-60", "60+"];
const genders = ["Male", "Female"];
const castes = ["General", "OBC", "SC", "ST"];
const incomes = ["Low", "Middle", "High"];
const education = ["School", "Graduate", "Post-Graduate"];
const parties = ["BJP", "INC", "AAP", "NOTA"];
const years = [2020, 2021, 2022, 2023, 2024];

export const voters = Array.from({ length: 10000 }).map((_, i) => ({
  id: i + 1,
  state: states[Math.floor(Math.random() * states.length)],
  district: "District " + (i % 50),
  ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
  gender: genders[Math.floor(Math.random() * genders.length)],
  caste: castes[Math.floor(Math.random() * castes.length)],
  income: incomes[Math.floor(Math.random() * incomes.length)],
  education: education[Math.floor(Math.random() * education.length)],
  party: parties[Math.floor(Math.random() * parties.length)],
  year: years[Math.floor(Math.random() * years.length)],
}));
