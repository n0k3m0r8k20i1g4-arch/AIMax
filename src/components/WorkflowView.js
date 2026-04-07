import React, { memo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

function WorkflowView({ agents, tasks }) {
  const busy = agents.filter((a) => a.status === "busy").length;
  const rest = agents.filter((a) => a.status === "rest").length;
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Workflow</Text>
        <Text style={styles.meta}>
          busy {busy} / rest {rest} / done {done}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {agents.map((agent) => {
          const pct = Math.round((agent.currentProgress || 0) * 100);
          return (
            <View key={agent.id} style={styles.node}>
              <Text style={styles.nodeName} numberOfLines={1}>
                {agent.name}
              </Text>
              <Text style={styles.nodeMeta} numberOfLines={1}>
                {agent.service}
              </Text>
              <Text style={styles.nodeMeta} numberOfLines={1}>
                {agent.primarySkill}
              </Text>

              <View style={styles.dotRow}>
                <View
                  style={[
                    styles.dot,
                    agent.status === "busy" && styles.dotBusy,
                    agent.status === "rest" && styles.dotRest,
                    agent.status === "idle" && styles.dotIdle,
                  ]}
                />
                <Text style={styles.status}>{agent.status}</Text>
              </View>

              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.percent}>{pct}%</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default memo(WorkflowView);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#121923",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2a36",
    padding: 14,
    marginBottom: 14,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  meta: {
    color: "#9aa4b2",
    fontSize: 12,
    marginTop: 3,
  },
  node: {
    width: 128,
    backgroundColor: "#0f151d",
    borderWidth: 1,
    borderColor: "#22303f",
    borderRadius: 14,
    padding: 10,
    marginRight: 10,
  },
  nodeName: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  nodeMeta: {
    color: "#9aa4b2",
    fontSize: 11,
    marginTop: 2,
  },
  dotRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: "#94a3b8",
    marginRight: 6,
  },
  dotBusy: {
    backgroundColor: "#1db954",
  },
  dotRest: {
    backgroundColor: "#57b8ff",
  },
  dotIdle: {
    backgroundColor: "#94a3b8",
  },
  status: {
    color: "#dbe4ee",
    fontSize: 11,
    fontWeight: "600",
  },
  barTrack: {
    height: 7,
    backgroundColor: "#1f2a36",
    borderRadius: 99,
    overflow: "hidden",
  },
  barFill: {
    height: 7,
    backgroundColor: "#1db954",
    borderRadius: 99,
  },
  percent: {
    color: "#9aa4b2",
    fontSize: 11,
    marginTop: 6,
  },
});
