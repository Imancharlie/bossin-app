import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Transaction } from "@/types";

const CATEGORIES: Record<string, string> = {
  Contribution: "trending-up",
  "Daily Collection": "trending-up",
  Operations: "briefcase",
  Transfer: "repeat",
  Other: "circle",
};

interface TransactionItemProps {
  transaction: Transaction;
  currency: string;
  onPress?: () => void;
}

export function TransactionItem({ transaction, currency, onPress }: TransactionItemProps) {
  const colors = useColors();

  const isIncome = transaction.type === "income";
  const isExpense = transaction.type === "expense";

  const accentColor = isIncome ? colors.success : isExpense ? colors.destructive : colors.info;
  const iconName = CATEGORIES[transaction.category] ?? "circle";

  const dateLabel = new Date(transaction.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.iconBg, { backgroundColor: accentColor + "18" }]}>
        <Feather name={iconName as any} size={18} color={accentColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.category, { color: colors.foreground }]} numberOfLines={1}>
          {transaction.category}
        </Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={1}>
          {transaction.memberName ?? transaction.description}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: accentColor }]}>
          {isIncome ? "+" : "-"}{currency} {transaction.amount.toLocaleString()}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>{dateLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  category: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  desc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  right: { alignItems: "flex-end" },
  amount: { fontSize: 14, fontFamily: "Inter_700Bold" },
  date: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
});
