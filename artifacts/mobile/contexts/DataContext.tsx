import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AppData, DailyCollection, Member, Organization, Transaction } from "@/types";

const DATA_KEY = "@bossin_data";

const SEED_DATA: AppData = {
  organization: {
    id: "org_1",
    name: "Kodin Softwares",
    description: "Track contributions for the kodin softwares",
    target: 8900000,
    currency: "TZS",
    createdAt: new Date().toISOString(),
  },
  members: [
    { id: "m1", name: "Boniface Gideon", phone: "0745 836 184", yearOfStudy: 3, target: 100000, paid: 0, createdAt: "2025-01-01" },
    { id: "m2", name: "Adelqueen Godwin Maro", phone: "0677722090", yearOfStudy: 2, target: 100000, paid: 0, createdAt: "2025-01-01" },
    { id: "m3", name: "Alex Katungulu Apolinari", phone: "0760823728", yearOfStudy: 1, target: 100000, paid: 0, createdAt: "2025-01-01" },
    { id: "m4", name: "Alexander Waziri", phone: "0612334324", yearOfStudy: 3, target: 100000, paid: 0, createdAt: "2025-01-01" },
    { id: "m5", name: "Alinanuswe Edward", phone: "+255 774 546 630", yearOfStudy: 2, target: 100000, paid: 0, createdAt: "2025-01-01" },
    { id: "m6", name: "Aminata Ezekiel", phone: "0755123456", yearOfStudy: 1, target: 100000, paid: 25000, createdAt: "2025-01-01" },
    { id: "m7", name: "Aneth Deus Kyaruzi", phone: "0743987654", yearOfStudy: 3, target: 100000, paid: 100000, createdAt: "2025-01-01" },
    { id: "m8", name: "Betina Issa Msondo", phone: "0768543210", yearOfStudy: 2, target: 100000, paid: 50000, createdAt: "2025-01-01" },
    { id: "m9", name: "Brian Julius", phone: "0712456789", yearOfStudy: 1, target: 100000, paid: 75000, createdAt: "2025-01-01" },
    { id: "m10", name: "Brown Geofrey", phone: "0732109876", yearOfStudy: 3, target: 100000, paid: 100000, createdAt: "2025-01-01" },
  ],
  transactions: [
    { id: "t1", memberId: "m7", memberName: "Aneth Deus Kyaruzi", type: "income", amount: 100000, category: "Contribution", description: "Full payment", date: "2026-06-01", recordedBy: "bossin" },
    { id: "t2", memberId: "m10", memberName: "Brown Geofrey", type: "income", amount: 100000, category: "Contribution", description: "Full payment", date: "2026-06-05", recordedBy: "bossin" },
    { id: "t3", memberId: "m9", memberName: "Brian Julius", type: "income", amount: 75000, category: "Contribution", description: "Partial payment", date: "2026-06-10", recordedBy: "staff" },
    { id: "t4", memberId: "m8", memberName: "Betina Issa Msondo", type: "income", amount: 50000, category: "Contribution", description: "Partial payment", date: "2026-06-12", recordedBy: "staff" },
    { id: "t5", memberId: "m6", memberName: "Aminata Ezekiel", type: "income", amount: 25000, category: "Contribution", description: "Initial payment", date: "2026-06-15", recordedBy: "bossin" },
    { id: "t6", memberId: null, memberName: null, type: "expense", amount: 15000, category: "Operations", description: "Office supplies", date: "2026-06-14", recordedBy: "bossin" },
  ],
  collections: [],
};

interface DataContextType {
  data: AppData;
  isLoading: boolean;
  addMember: (member: Omit<Member, "id" | "paid" | "createdAt">) => Promise<void>;
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  addTransaction: (tx: Omit<Transaction, "id">) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  recordCollection: (collection: Omit<DailyCollection, "id">) => Promise<void>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  refreshData: () => Promise<void>;
  totalCollected: number;
  totalExpenses: number;
  progress: number;
  completeCount: number;
  incompleteCount: number;
  notStartedCount: number;
  todayCollected: number;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

function genId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

function computeStats(data: AppData) {
  const today = new Date().toISOString().split("T")[0];
  const totalCollected = data.members.reduce((s, m) => s + m.paid, 0);
  const totalExpenses = data.transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const progress = data.organization.target > 0
    ? Math.min(100, (totalCollected / data.organization.target) * 100)
    : 0;
  const completeCount = data.members.filter((m) => m.paid >= m.target).length;
  const incompleteCount = data.members.filter((m) => m.paid > 0 && m.paid < m.target).length;
  const notStartedCount = data.members.filter((m) => m.paid === 0).length;
  const todayCollected = data.transactions
    .filter((t) => t.type === "income" && t.date === today)
    .reduce((s, t) => s + t.amount, 0);
  return { totalCollected, totalExpenses, progress, completeCount, incompleteCount, notStartedCount, todayCollected };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(SEED_DATA);
  const [isLoading, setIsLoading] = useState(true);

  const persist = useCallback(async (newData: AppData) => {
    await AsyncStorage.setItem(DATA_KEY, JSON.stringify(newData));
    setData(newData);
  }, []);

  const refreshData = useCallback(async () => {
    const stored = await AsyncStorage.getItem(DATA_KEY);
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      await AsyncStorage.setItem(DATA_KEY, JSON.stringify(SEED_DATA));
      setData(SEED_DATA);
    }
  }, []);

  useEffect(() => {
    refreshData().finally(() => setIsLoading(false));
  }, [refreshData]);

  const addMember = async (member: Omit<Member, "id" | "paid" | "createdAt">) => {
    const newMember: Member = { ...member, id: genId(), paid: 0, createdAt: new Date().toISOString() };
    const newData = { ...data, members: [...data.members, newMember] };
    await persist(newData);
  };

  const updateMember = async (id: string, updates: Partial<Member>) => {
    const newData = { ...data, members: data.members.map((m) => m.id === id ? { ...m, ...updates } : m) };
    await persist(newData);
  };

  const deleteMember = async (id: string) => {
    const newData = {
      ...data,
      members: data.members.filter((m) => m.id !== id),
      transactions: data.transactions.filter((t) => t.memberId !== id),
    };
    await persist(newData);
  };

  const addTransaction = async (tx: Omit<Transaction, "id">) => {
    const newTx: Transaction = { ...tx, id: genId() };
    const newMembers = tx.memberId && tx.type === "income"
      ? data.members.map((m) => m.id === tx.memberId ? { ...m, paid: m.paid + tx.amount } : m)
      : data.members;
    const newData = { ...data, transactions: [newTx, ...data.transactions], members: newMembers };
    await persist(newData);
  };

  const deleteTransaction = async (id: string) => {
    const tx = data.transactions.find((t) => t.id === id);
    let newMembers = data.members;
    if (tx && tx.memberId && tx.type === "income") {
      newMembers = data.members.map((m) =>
        m.id === tx.memberId ? { ...m, paid: Math.max(0, m.paid - tx.amount) } : m
      );
    }
    const newData = { ...data, transactions: data.transactions.filter((t) => t.id !== id), members: newMembers };
    await persist(newData);
  };

  const recordCollection = async (collection: Omit<DailyCollection, "id">) => {
    const tx: Omit<Transaction, "id"> = {
      memberId: collection.memberId,
      memberName: collection.memberName,
      type: "income",
      amount: collection.amount,
      category: "Daily Collection",
      description: "Daily collection payment",
      date: collection.date,
      recordedBy: "staff",
    };
    await addTransaction(tx);
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    const newData = { ...data, organization: { ...data.organization, ...updates } };
    await persist(newData);
  };

  const stats = computeStats(data);

  return (
    <DataContext.Provider value={{
      data, isLoading, addMember, updateMember, deleteMember,
      addTransaction, deleteTransaction, recordCollection, updateOrganization, refreshData,
      ...stats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
