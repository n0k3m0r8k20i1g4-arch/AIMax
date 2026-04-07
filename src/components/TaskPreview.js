import React, { memo } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

function TaskPreview({ task, agent }) {
  if (!task) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Task Preview</Text>
        <Text style={styles.empty}>選択されたタスクはありません。</Text>
      </View>
    );
  }

  const percent = Math.round((task.progress || 0) * 100);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Task Preview</Text>

      <View style={styles.metaRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{task.skill}</Text>
        </View>
        <View style={styles.badgeAlt}>
          <Text style={styles.badgeText}>{task.status}</Text>
        </View>
        <View style={styles.badgeAlt}>
          <Text style={styles.badgeText}>{percent}%</Text>
        </View>
      </View>

      <Text style={styles.taskName}>{task.name}</Text>
      <Text style={styles.sub}>
        {agent ? `${agent.name} / ${agent.service}` : "担当者未選択"}
      </Text>
      <Text style={styles.sub}>{task.brief}</Text>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>

      {task.output ? (
        <ScrollView style={styles.outputBox}>
          <Text style={styles.outputTitle}>
            {task.output.title} · {task.output.kind}
          </Text>
          {task.output.visualUri ? (
            <Image source={{ uri: task.output.visualUri }} style={styles.image} />
          ) : null}
          <Text style={styles.outputBody}>{task.output.body}</Text>
          <Text style={styles.stamp}>{task.output.stamp}</Text>
        </ScrollView>
      ) : (
        <View style={styles.waitBox}>
          <Text style={styles.waitText}>生成中です。進捗が100%になると成果物が出ます。</Text>
        </View>
      )}
    </View>
  );
}

export default memo(TaskPreview);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#121923",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2a36",
    padding: 14,
    marginBottom: 14,
  },
  title: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  empty: {
    color: "#9aa4b2",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  badge: {
    backgroundColor: "#1db954",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeAlt: {
    backgroundColor: "#1f2a36",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  taskName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  sub: {
    color: "#9aa4b2",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
  track: {
    marginTop: 12,
    height: 8,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: "#1f2a36",
  },
  fill: {
    height: 8,
    borderRadius: 99,
    backgroundColor: "#1db954",
  },
  outputBox: {
    marginTop: 14,
    backgroundColor: "#0f151d",
    borderRadius: 14,
    padding: 12,
    maxHeight: 260,
  },
  outputTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
  },
  outputBody: {
    color: "#dbe4ee",
    fontSize: 13,
    lineHeight: 19,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#0b0f14",
  },
  stamp: {
    color: "#9aa4b2",
    fontSize: 11,
    marginTop: 8,
  },
  waitBox: {
    marginTop: 14,
    backgroundColor: "#0f151d",
    borderRadius: 14,
    padding: 12,
  },
  waitText: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 18,
  },
});
