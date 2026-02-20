export type Voter = {
  id: number;
  state: "UP" | "MH" | "RJ" | "DL" | "KA" | "TN" | "AP" | "WB" | "GJ" | "HR" | "PB" | "MP" | "CG" | "OR" | "BR" | "AS" | "NE" | "JH" | "UT" | "HP" | "JK" | "TR" | "AR" | "ML" | "MZ" | "SK" | "AN" | "LD" | "CH" | "DN" | "DD" | 	"PY"| 	"AZ"| 	"AU"| 	"BH"| 	"BK"| 	"CW"| 	"DH"| 	"GZ"| 	"HY"| 	"IK"| 	"LK"| 	"MZ"| 	"NQ"| 	"PJ"| 	"SX"| 	"TJ"| 	"WB";
  district: string;
  ageGroup: "18-25" | "26-40" | "41-60" | "60+";
  gender: "Male" | "Female" | "Other";
  caste: "General" | "OBC" | "SC" | "ST";
  income: "Low" | "Middle" | "High";
  education: "School" | "Graduate" | "Post-Graduate";
  party: "BJP" | "INC" | "AAP" | "NOTA";
  year: 2020 | 2021 | 2022 | 2023 | 2024;
};
