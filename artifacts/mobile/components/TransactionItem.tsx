import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
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
  const { width } = useWindowDimensions();
  const isNarrow = width < 380;

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
      <View style={[styles.iconBg, { backgroundColor: accentColor + "18", width: isNarrow ? 34 : 38, height: isNarrow ? 34 : 38 }]}>
        <Feather name={iconName as any} size={isNarrow ? 14 : 16} color={accentColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.category, { color: colors.foreground, fontSize: isNarrow ? 12 : 13 }]} numberOfLines={1}>
          {transaction.category}
        </Text>
        <Text style={[styles.desc, { color: colors.mutedForeground, fontSize: isNarrow ? 10 : 11 }]} numberOfLines={1}>
          {transaction.memberName ?? transaction.description}
        </Text>
      </View>
      <View style={styles.right}>
        <Text
          style={[styles.amount, { color: accentColor, fontSize: isNarrow ? 12 : 13 }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {isIncome ? "+" : "-"}{currency} {transaction.amount.toLocaleString()}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground, fontSize: isNarrow ? 10 : 11 }]}>{dateLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 7,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  iconBg: { borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  info: { flex: 1, overflow: "hidden" },
  category: { fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  desc: { fontFamily: "Inter_400Regular" },
  right: { alignItems: "flex-end", flexShrink: 0 },
  amount: { fontFamily: "Inter_700Bold" },
  date: { fontFamily: "Inter_400Regular", marginTop: 2 },
});
