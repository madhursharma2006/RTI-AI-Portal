export const DEPARTMENTS = [
  { id: 'health', name: 'Health & Family Welfare', emoji: '🏥', keywords: ['hospital', 'doctor', 'medicine', 'vaccine', 'ambulance', 'clinic', 'health', 'patient', 'nurse', 'dispensary', 'medical'] },
  { id: 'education', name: 'School & Higher Education', emoji: '🎓', keywords: ['school', 'teacher', 'student', 'college', 'exam', 'education', 'admission', 'mid-day', 'university'] },
  { id: 'works', name: 'Public Works (Roads & Bridges)', emoji: '🛣️', keywords: ['road', 'pothole', 'bridge', 'highway', 'construction', 'tender', 'contractor', 'pwd', 'flyover', 'repair'] },
  { id: 'municipal', name: 'Urban Local Bodies / Municipal', emoji: '🏙️', keywords: ['garbage', 'sanitation', 'streetlight', 'municipal', 'drain', 'park', 'waste', 'corporation', 'sewer', 'building plan'] },
  { id: 'water', name: 'Water Supply & Sanitation', emoji: '💧', keywords: ['water', 'pipeline', 'drinking', 'tap', 'borewell', 'tanker', 'sewerage'] },
  { id: 'power', name: 'Power & Electricity', emoji: '⚡', keywords: ['electricity', 'power', 'transformer', 'meter', 'outage', 'voltage', 'electric', 'billing'] },
  { id: 'police', name: 'Home & Police', emoji: '🚓', keywords: ['police', 'fir', 'crime', 'traffic', 'challan', 'constable', 'station', 'theft', 'arrest'] },
  { id: 'revenue', name: 'Revenue & Land Records', emoji: '📜', keywords: ['land', 'property', 'mutation', 'tehsil', 'patwari', 'registry', 'khasra', 'revenue', 'encroachment', 'plot'] },
  { id: 'transport', name: 'Transport', emoji: '🚌', keywords: ['bus', 'license', 'licence', 'vehicle', 'permit', 'rto', 'registration', 'driving', 'transport'] },
  { id: 'food', name: 'Food & Civil Supplies', emoji: '🌾', keywords: ['ration', 'pds', 'wheat', 'rice', 'food', 'fair price', 'civil supplies', 'grain'] },
  { id: 'welfare', name: 'Social Welfare', emoji: '🤝', keywords: ['pension', 'widow', 'disability', 'scheme', 'subsidy', 'welfare', 'beneficiary', 'old age'] },
  { id: 'agri', name: 'Agriculture & Farmers', emoji: '🚜', keywords: ['farmer', 'crop', 'agriculture', 'fertilizer', 'seed', 'msp', 'irrigation', 'kisan', 'mandi'] },
  { id: 'finance', name: 'Finance & Treasury', emoji: '💰', keywords: ['budget', 'fund', 'expenditure', 'salary', 'grant', 'audit', 'treasury', 'tax', 'allocation'] },
];

export const getDepartment = (id) => DEPARTMENTS.find((d) => d.id === id) || DEPARTMENTS[0];
