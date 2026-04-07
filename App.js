import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createAgents } from "./src/data/agents";
import { createTasks } from "./src/data/tasks";
import { stepEngine } from "./src/utils/engine";
import WorkflowView from "./src/components/WorkflowView";
import TaskPreview from "./src/components/TaskPreview";

function inferSkillFromText(text) {
  const t = text.toLowerCase();

  const rules = [
    ["動画", "video"],
    ["映像", "video"],
    ["画像", "design"],
    ["デザイン", "design"],
    ["ui", "ux"],
    ["ux", "ux"],
    ["コード", "code"],
    ["実装", "code"],
    ["開発", "backend"],
    ["フロント", "frontend"],
    ["バック", "backend"],
    ["調査", "research"],
    ["検索", "research"],
    ["要約", "organize"],
    ["整理", "organize"],
    ["翻訳", "translate"],
    ["多言語", "translate"],
    ["音声", "voice"],
    ["営業", "sales"],
    ["crm", "sales"],
    ["法務", "legal"],
    ["契約", "legal"],
    ["予算", "finance"],
    ["会計", "finance"],
    ["分析", "analyze"],
    ["セキュリティ", "secure"],
    ["監査", "secure"],
    ["テスト", "testing"],
    ["検証", "testing"],
    ["公開", "publish"],
    ["デプロイ", "deployment"],
    ["自動化", "workflow"],
    ["ワークフロー", "workflow"],
    ["モバイル", "mobile"],
    ["スマホ", "mobile"],
    ["文章", "writing"],
    ["記事", "writing"],
    ["戦略", "strategy"],
    ["施策", "marketing"],
    ["成長", "growth"],
    ["コミュニティ", "support"],
    ["サポート", "support"],
    ["同期", "sync"],
    ["スケジュール", "schedule"],
  ];

  for (const [keyword, skill] of rules) {
    if (t.includes(keyword)) return skill;
  }
  return "workflow";
}

export default function App() {
  const [state, setState] = useState(() => ({
    agents: createAgents(),
    tasks: createTasks(),
    logs: [
      {
        id: "boot-1",
        ts: Date.now(),
        kind: "system",
        text: "AI社員チームが起動しました。",
      },
    ],
    selectedAgentId: 1,
    selectedTaskId: 1,
    command: "",
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => stepEngine(prev));
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  const selectedAgent = useMemo(() => {
    return state.agents.find((a) => a.id === state.selectedAgentId) || state.agents[0];
  }, [state.agents, state.selectedAgentId]);

  const selectedTask = useMemo(() => {
    return (
      state.tasks.find((t) => t.id === state.selectedTaskId) ||
      state.tasks.find((t) => t.status !== "done") ||
      state.tasks[0]
    );
  }, [state.tasks, state.selectedTaskId]);

  const counts = useMemo(() => {
    const idle = state.agents.filter((a) => a.status === "idle").length;
    const busy = state.agents.filter((a) => a.status === "busy").length;
    const rest = state.agents.filter((a) => a.status === "rest").length;
    const done = state.tasks.filter((t) => t.status === "done").length;
    const running = state.tasks.filter((t) => t.status === "running").length;
    return { idle, busy, rest, done, running };
  }, [state.agents, state.tasks]);

  const addTaskFromCommand = () => {
    const text = state.command.trim();
    if (!text) {
      Alert.alert("指示が空です");
      return;
    }

    const skill = inferSkillFromText(text);
    const newTask = {
      id: Date.now(),
      name: text,
      skill,
      brief: text,
      priority: 10,
      status: "queued",
      progress: 0,
      assignedTo: null,
      assignedToName: null,
      startedAt: null,
      completedAt: null,
      output: null,
    };

    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
      selectedTaskId: newTask.id,
      command: "",
      logs: [
        ...prev.logs.slice(-149),
        {
          id: `user-${Date.now()}`,
          ts: Date.now(),
          kind: "system",
          text: `USER → ${skill} タスク: ${text}`,
        },
      ],
    }));
  };

  const renderAgent = ({ item }) => {
    const isSelected = item.id === state.selectedAgentId;
    const task = state.tasks.find((t) => t.id === item.currentTaskId);
    const pct = Math.round((item.currentProgress || 0) * 100);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setState((prev) => ({
            ...prev,
            selectedAgentId: item.id,
            selectedTaskId: item.currentTaskId || prev.selectedTaskId,
          }));
        }}
        style={[
          styles.agentCard,
          item.status === "busy" && styles.agentBusy,
          item.status === "rest" && styles.agentRest,
          isSelected && styles.agentSelected,
        ]}
      >
        <Text style={styles.agentName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.agentService} numberOfLines={1}>
          {item.service}
        </Text>
        <Text style={styles.agentRole} numberOfLines={1}>
          {item.role}
        </Text>

        <View style={styles.chipRow}>
          <View style={styles.statusChip}>
            <Text style={styles.chipText}>{item.status}</Text>
          </View>
          <View style={styles.skillChip}>
            <Text style={styles.chipText}>{item.primarySkill}</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>

        <Text style={styles.progressText}>{pct}%</Text>

        <Text style={styles.smallText} numberOfLines={1}>
          {task ? `担当: ${task.name}` : "待機中"}
        </Text>
      </TouchableOpacity>
    );
  };

  const taskChips = state.tasks.slice(0, 18);

  const header = (
    <View>
      <Text style={styles.title}>AI社員フルチーム</Text>
      <Text style={styles.subtitle}>
        50体が裏で会話しながら、タスクを自動で回します。
      </Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{counts.idle}</Text>
          <Text style={styles.summaryLabel}>Idle</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{counts.busy}</Text>
          <Text style={styles.summaryLabel}>Busy</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{counts.rest}</Text>
          <Text style={styles.summaryLabel}>Rest</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{counts.running}</Text>
          <Text style={styles.summaryLabel}>Running</Text>
        </View>
      </View>

      <View style={styles.commandBox}>
        <Text style={styles.sectionTitle}>指示を入れる</Text>
        <TextInput
          value={state.command}
          onChangeText={(text) => setState((prev) => ({ ...prev, command: text }))}
          placeholder="例: 新しいランディングページを作って"
          placeholderTextColor="#777"
          style={styles.input}
          multiline
        />
        <TouchableOpacity style={styles.commandButton} onPress={addTaskFromCommand}>
          <Text style={styles.commandButtonText}>指示を送る</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.taskStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {taskChips.map((task) => {
            const active = task.id === state.selectedTaskId;
            return (
              <TouchableOpacity
                key={task.id}
                onPress={() => setState((prev) => ({ ...prev, selectedTaskId: task.id }))}
                style={[styles.taskChip, active && styles.taskChipActive]}
              >
                <Text style={styles.taskChipTitle} numberOfLines={1}>
                  {task.name}
                </Text>
                <Text style={styles.taskChipMeta}>
                  {task.skill} · {Math.round((task.progress || 0) * 100)}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <WorkflowView agents={state.agents} tasks={state.tasks} />

      <TaskPreview task={selectedTask} agent={selectedAgent} />

      <View style={styles.agentDetail}>
        <Text style={styles.sectionTitle}>選択中のAI</Text>
        <Text style={styles.detailName}>{selectedAgent?.name}</Text>
        <Text style={styles.detailMeta}>
          {selectedAgent?.service} / {selectedAgent?.role}
        </Text>
        <Text style={styles.detailMeta}>
          skill: {selectedAgent?.primarySkill} / 状態: {selectedAgent?.status}
        </Text>
        <Text style={styles.detailMeta}>
          inbox {selectedAgent?.inbox?.length || 0} / outbox {selectedAgent?.outbox?.length || 0}
        </Text>
        <View style={styles.historyBox}>
          {(selectedAgent?.history || []).slice(-4).map((h, idx) => (
            <Text key={`${selectedAgent.id}-${idx}`} style={styles.historyLine}>
              {h.text}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.logBox}>
        <Text style={styles.sectionTitle}>裏で流れている会話</Text>
        {state.logs.slice(-14).reverse().map((log) => (
          <Text key={log.id} style={styles.logLine}>
            {log.text}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={state.agents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderAgent}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={header}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b0f14",
  },
  listContent: {
    padding: 14,
    paddingBottom: 40,
  },
  title: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "#9aa4b2",
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#121923",
    borderWidth: 1,
    borderColor: "#1f2a36",
    borderRadius: 14,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: "center",
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  summaryLabel: {
    color: "#8c98a7",
    fontSize: 12,
    marginTop: 3,
  },
  commandBox: {
    backgroundColor: "#121923",
    borderColor: "#1f2a36",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    minHeight: 92,
    backgroundColor: "#0f151d",
    borderColor: "#22303f",
    borderWidth: 1,
    borderRadius: 14,
    color: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: "top",
    fontSize: 14,
  },
  commandButton: {
    backgroundColor: "#1db954",
    borderRadius: 14,
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  commandButtonText: {
    color: "#0b0f14",
    fontWeight: "800",
    fontSize: 15,
  },
  taskStrip: {
    marginBottom: 14,
  },
  taskChip: {
    width: 160,
    borderRadius: 14,
    backgroundColor: "#121923",
    borderColor: "#1f2a36",
    borderWidth: 1,
    padding: 12,
    marginRight: 10,
  },
  taskChipActive: {
    borderColor: "#1db954",
    shadowColor: "#1db954",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  taskChipTitle: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 6,
  },
  taskChipMeta: {
    color: "#8c98a7",
    fontSize: 11,
  },
  agentDetail: {
    backgroundColor: "#121923",
    borderColor: "#1f2a36",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  detailName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
  },
  detailMeta: {
    color: "#9aa4b2",
    marginTop: 4,
    fontSize: 12,
  },
  historyBox: {
    marginTop: 10,
    backgroundColor: "#0f151d",
    borderRadius: 14,
    padding: 10,
  },
  historyLine: {
    color: "#c7d0db",
    fontSize: 12,
    marginBottom: 4,
  },
  logBox: {
    backgroundColor: "#121923",
    borderColor: "#1f2a36",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  logLine: {
    color: "#cbd5e1",
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 17,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  agentCard: {
    width: "48.5%",
    backgroundColor: "#121923",
    borderWidth: 1,
    borderColor: "#1f2a36",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  agentBusy: {
    borderColor: "#1db954",
  },
  agentRest: {
    borderColor: "#57b8ff",
  },
  agentSelected: {
    borderColor: "#ffd166",
  },
  agentName: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 4,
  },
  agentService: {
    color: "#9aa4b2",
    fontSize: 12,
    marginBottom: 2,
  },
  agentRole: {
    color: "#9aa4b2",
    fontSize: 12,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  statusChip: {
    backgroundColor: "#1f2a36",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  skillChip: {
    backgroundColor: "#1f2a36",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    color: "#dbe4ee",
    fontSize: 11,
    fontWeight: "600",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#0f151d",
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#1db954",
  },
  progressText: {
    color: "#9aa4b2",
    fontSize: 11,
    marginBottom: 6,
  },
  smallText: {
    color: "#c7d0db",
    fontSize: 11,
  },
});
