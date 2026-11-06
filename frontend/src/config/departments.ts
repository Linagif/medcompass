import {
  Apple, Baby, Bone, Brain, Bug, Cross, FlaskConical, Flower2, Hand,
  HeartHandshake, HeartPulse, Pill, Ribbon, Sprout, Stethoscope, Wind,
  type LucideIcon,
} from "lucide-react";

/**
 * One reusable configuration drives the sidebar, the department cards, the top bar
 * and the "suggested questions". To add a department, add an entry here and (for
 * extra prompt context) a matching id in backend/app/services/prompts.py.
 *
 * A department only gives CONTEXT to the answer. It never limits what can be asked,
 * and it does not mean a curated database exists for that specialty (planned for Phase 2).
 */
export interface Department {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  suggestions: string[];
}

export const DEFAULT_DEPARTMENT_ID = "general-health";

export const DEPARTMENTS: Department[] = [
  { id: "general-health", name: "General Health", description: "Everyday conditions, symptoms and healthy living.", icon: Stethoscope,
    suggestions: ["What is the difference between a virus and a bacterial infection?", "What are common causes of fatigue?", "How is high blood pressure usually diagnosed?"] },
  { id: "oncology", name: "Oncology", description: "Cancer types, screening, treatment and research.", icon: Ribbon,
    suggestions: ["How do cancer screening tests work?", "What is the difference between chemotherapy and immunotherapy?", "What does cancer staging mean?"] },
  { id: "pediatrics", name: "Pediatrics", description: "Children's growth, development and common illnesses.", icon: Baby,
    suggestions: ["What are typical childhood vaccination schedules based on?", "How can parents recognise dehydration warning signs in children?", "What is a normal developmental milestone range?"] },
  { id: "mental-health", name: "Mental Health", description: "Mood, anxiety, stress and psychological wellbeing.", icon: HeartHandshake,
    suggestions: ["What is the difference between anxiety and a panic attack?", "How is depression usually assessed by clinicians?", "What therapies are commonly used for anxiety disorders?"] },
  { id: "cardiology", name: "Cardiology", description: "Heart and blood-vessel conditions and prevention.", icon: HeartPulse,
    suggestions: ["What are the main risk factors for heart disease?", "What does an ECG show?", "What is atrial fibrillation?"] },
  { id: "neurology", name: "Neurology", description: "Brain, spinal cord and nervous-system conditions.", icon: Brain,
    suggestions: ["What causes migraines?", "What is the difference between epilepsy and a seizure?", "How is Parkinson's disease diagnosed?"] },
  { id: "dermatology", name: "Dermatology", description: "Skin, hair and nail conditions.", icon: Hand,
    suggestions: ["What is the difference between eczema and psoriasis?", "How does sunscreen protect the skin?", "What are the warning signs that a mole should be checked?"] },
  { id: "nutrition", name: "Nutrition", description: "Diet, nutrients and nutrition-related conditions.", icon: Apple,
    suggestions: ["What is a balanced diet?", "What is the role of fibre in digestion?", "What are common signs of iron deficiency?"] },
  { id: "reproductive-health", name: "Reproductive Health", description: "Contraception, fertility and reproductive conditions.", icon: Flower2,
    suggestions: ["How do common contraceptive methods differ?", "What is polycystic ovary syndrome (PCOS)?", "What factors affect fertility?"] },
  { id: "pregnancy-maternal-health", name: "Pregnancy and Maternal Health", description: "Pregnancy, birth and postpartum health.", icon: Sprout,
    suggestions: ["What happens at routine antenatal check-ups?", "What is gestational diabetes?", "What is pre-eclampsia?"] },
  { id: "orthopedics", name: "Orthopedics", description: "Bones, joints, muscles and injuries.", icon: Bone,
    suggestions: ["What is the difference between osteoarthritis and rheumatoid arthritis?", "How are fractures treated?", "What causes lower back pain?"] },
  { id: "respiratory-health", name: "Respiratory Health", description: "Lungs, breathing and airway conditions.", icon: Wind,
    suggestions: ["What is asthma and what triggers it?", "What is COPD?", "How does a spirometry test work?"] },
  { id: "infectious-diseases", name: "Infectious Diseases", description: "Infections, transmission, vaccines and prevention.", icon: Bug,
    suggestions: ["How do vaccines work?", "What is antibiotic resistance?", "How is malaria transmitted and prevented?"] },
  { id: "first-aid", name: "First Aid", description: "General first-aid concepts. Not a substitute for emergency care.", icon: Cross,
    suggestions: ["What are the general principles of first aid?", "How should a minor burn be cooled?", "What is the recovery position?"] },
  { id: "medication-education", name: "Medication Education", description: "How medicines work, in general terms. No personal dosing.", icon: Pill,
    suggestions: ["What is the difference between generic and brand-name medicines?", "What are antibiotics and when are they not helpful?", "What does a drug interaction mean?"] },
  { id: "medical-research", name: "Medical Research", description: "Study types, evidence quality and how to read research.", icon: FlaskConical,
    suggestions: ["What is the difference between a randomized trial and an observational study?", "What is a systematic review?", "Why can studies reach conflicting results?"] },
];

export function getDepartment(id: string): Department {
  return DEPARTMENTS.find((d) => d.id === id) ?? DEPARTMENTS[0];
}
