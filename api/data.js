import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    if (req.method === "GET" && req.query.action === "load") {
      const { data: judges } = await supabase.from("judges").select("*");
      const { data: contestants } = await supabase
        .from("contestants")
        .select("*");
      const { data: scoreRows } = await supabase.from("scores").select("*");

      const scores = {};
      scoreRows.forEach((row) => {
        if (!scores[row.judge_id]) scores[row.judge_id] = {};
        scores[row.judge_id][row.contestant_id] = row.score;
      });

      return res.json({
        success: true,
        judges,
        contestants,
        scores,
      });
    }

    if (req.method === "POST" && req.query.action === "save") {
      const data = req.body;

      // 清空旧表数据
      await supabase.from("judges").delete().neq("id", "");
      await supabase.from("contestants").delete().neq("id", "");
      await supabase.from("scores").delete().neq("judge_id", "");

      // 插入 judges
      for (const j of data.judges) {
        await supabase.from("judges").insert(j);
      }

      // 插入 contestants
      for (const c of data.contestants) {
        await supabase.from("contestants").insert(c);
      }

      // 插入 scores
      for (const judgeId in data.scores) {
        for (const contestantId in data.scores[judgeId]) {
          await supabase.from("scores").insert({
            judge_id: judgeId,
            contestant_id: contestantId,
            score: data.scores[judgeId][contestantId],
          });
        }
      }

      return res.json({ success: true });
    }

    res.status(400).json({ success: false, message: "无效请求" });
  } catch (err) {
    console.error("Supabase Error:", err);
    res.status(500).json({ success: false, message: "服务器错误" });
  }
}
