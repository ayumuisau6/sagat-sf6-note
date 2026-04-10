import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

// ─────────────────────────────────────────────
// STATIC FRAME DATA (サガット全技)
// ─────────────────────────────────────────────
const MOVES = [
  {id:"3855",name:"立ち弱P",cmd:"LP",attr:"通常",startup:5,active:3,recovery:11,total:18,onHit:"+4",onBlock:"-3",dmg:300,cancel:"C",guard:"上",inv:"",notes:"連打キャンセル対応"},
  {id:"3856",name:"立ち弱K",cmd:"LK",attr:"通常",startup:7,active:2,recovery:15,total:23,onHit:"-1",onBlock:"-4",dmg:400,cancel:"C",guard:"上",inv:"",notes:"空振り時硬直2F増加"},
  {id:"3857",name:"立ち中P",cmd:"MP",attr:"通常",startup:6,active:4,recovery:15,total:24,onHit:"+6",onBlock:"+2",dmg:600,cancel:"",guard:"上",inv:"",notes:""},
  {id:"3858",name:"立ち中K",cmd:"MK",attr:"通常",startup:11,active:4,recovery:19,total:33,onHit:"+3",onBlock:"-3",dmg:700,cancel:"",guard:"上",inv:"",notes:""},
  {id:"3859",name:"立ち強P",cmd:"HP",attr:"通常",startup:15,active:4,recovery:22,total:40,onHit:"0",onBlock:"-5",dmg:800,cancel:"",guard:"上",inv:"",notes:"空振り時硬直3F増加"},
  {id:"3860",name:"立ち強K",cmd:"HK",attr:"通常",startup:10,active:6,recovery:21,total:36,onHit:"+1",onBlock:"-5",dmg:900,cancel:"C",guard:"上",inv:"",notes:"強制立ち効果"},
  {id:"3861",name:"しゃがみ弱P",cmd:"2LP",attr:"通常",startup:4,active:2,recovery:10,total:15,onHit:"+5",onBlock:"-1",dmg:300,cancel:"C",guard:"上",inv:"",notes:"連打キャンセル対応"},
  {id:"3862",name:"しゃがみ弱K",cmd:"2LK",attr:"通常",startup:5,active:3,recovery:12,total:19,onHit:"+1",onBlock:"-3",dmg:200,cancel:"",guard:"下",inv:"",notes:"連打キャンセル対応"},
  {id:"3863",name:"しゃがみ中P",cmd:"2MP",attr:"通常",startup:7,active:3,recovery:16,total:25,onHit:"+4",onBlock:"-1",dmg:600,cancel:"C",guard:"上",inv:"",notes:""},
  {id:"3864",name:"しゃがみ中K",cmd:"2MK",attr:"通常",startup:9,active:3,recovery:18,total:29,onHit:"+5",onBlock:"-2",dmg:600,cancel:"",guard:"下",inv:"",notes:""},
  {id:"3865",name:"しゃがみ強P",cmd:"2HP",attr:"通常",startup:11,active:4,recovery:21,total:35,onHit:"+1",onBlock:"-5",dmg:800,cancel:"C",guard:"上",inv:"",notes:""},
  {id:"3866",name:"しゃがみ強K",cmd:"2HK",attr:"通常",startup:11,active:3,recovery:26,total:39,onHit:"D",onBlock:"-12",dmg:900,cancel:"",guard:"下",inv:"",notes:"パニカン時ハードノックダウン"},
  {id:"3867",name:"J弱P",cmd:"(J)LP",attr:"ジャンプ",startup:4,active:7,recovery:"着地後3",total:13,onHit:"",onBlock:"",dmg:300,cancel:"",guard:"中",inv:"",notes:""},
  {id:"3868",name:"J弱K",cmd:"(J)LK",attr:"ジャンプ",startup:5,active:10,recovery:"着地後3",total:17,onHit:"",onBlock:"",dmg:300,cancel:"",guard:"中",inv:"",notes:"めくり性能"},
  {id:"3869",name:"J中P",cmd:"(J)MP",attr:"ジャンプ",startup:8,active:5,recovery:"着地後3",total:15,onHit:"",onBlock:"",dmg:700,cancel:"",guard:"※中",inv:"",notes:""},
  {id:"3870",name:"J中K",cmd:"(J)MK",attr:"ジャンプ",startup:8,active:8,recovery:"着地後3",total:18,onHit:"",onBlock:"",dmg:700,cancel:"",guard:"中",inv:"",notes:""},
  {id:"3871",name:"J強P",cmd:"(J)HP",attr:"ジャンプ",startup:10,active:6,recovery:"着地後3",total:18,onHit:"",onBlock:"",dmg:800,cancel:"",guard:"中",inv:"",notes:"叩きつけダウン"},
  {id:"3872",name:"J強K",cmd:"(J)HK",attr:"ジャンプ",startup:10,active:6,recovery:"着地後3",total:18,onHit:"",onBlock:"",dmg:800,cancel:"",guard:"中",inv:"",notes:"吹き飛びダウン"},
  {id:"3873",name:"ヘビーエルボー",cmd:"6MP",attr:"特殊",startup:22,active:3,recovery:19,total:43,onHit:"+3",onBlock:"-3",dmg:700,cancel:"",guard:"中",inv:"",notes:"空中ヒット時床バウンド"},
  {id:"3874",name:"タイガーモノリス",cmd:"4HP",attr:"特殊",startup:8,active:8,recovery:25,total:40,onHit:"D",onBlock:"-10",dmg:800,cancel:"C",guard:"上",inv:"",notes:"初段カウンター/パニカン時床バウンド"},
  {id:"3875",name:"ステップローキック",cmd:"6LK",attr:"特殊",startup:18,active:3,recovery:18,total:38,onHit:"+3",onBlock:"-3",dmg:700,cancel:"",guard:"下",inv:"",notes:""},
  {id:"3876",name:"ステップハイキック",cmd:"6HK",attr:"特殊",startup:16,active:4,recovery:21,total:40,onHit:"+7",onBlock:"+4",dmg:900,cancel:"",guard:"上",inv:"",notes:"パニカン時+21F"},
  {id:"3877",name:"ステップミドルキック",cmd:"MK>HK",attr:"特殊",startup:19,active:3,recovery:23,total:44,onHit:"D",onBlock:"-8",dmg:800,cancel:"",guard:"上",inv:"",notes:""},
  {id:"3878",name:"タイガースティング",cmd:"HP>HK",attr:"特殊",startup:16,active:3,recovery:27,total:45,onHit:"D",onBlock:"-12",dmg:1200,cancel:"",guard:"上",inv:"",notes:""},
  {id:"3879",name:"タイガースラッシュ",cmd:"2MP>HP",attr:"特殊",startup:20,active:3,recovery:27,total:49,onHit:"-2",onBlock:"-14",dmg:600,cancel:"C",guard:"上",inv:"",notes:""},
  {id:"3880",name:"タイガーライズ",cmd:"2MP>HK",attr:"特殊",startup:18,active:4,recovery:26,total:47,onHit:"D",onBlock:"-10",dmg:1000,cancel:"SA",guard:"上",inv:"",notes:""},
  {id:"3881",name:"中タイガーショット",cmd:"236MP",attr:"必殺技",startup:16,active:"",recovery:"全体42",total:42,onHit:"+3",onBlock:"+3",dmg:700,cancel:"SA3",guard:"上・弾",inv:"",notes:""},
  {id:"3882",name:"強タイガーショット",cmd:"236HP",attr:"必殺技",startup:12,active:"",recovery:"全体42",total:42,onHit:"-1",onBlock:"-1",dmg:700,cancel:"SA3",guard:"上・弾",inv:"",notes:""},
  {id:"3883",name:"ODタイガーショット",cmd:"236MP+HP",attr:"必殺技",startup:21,active:"",recovery:"全体48",total:48,onHit:"D",onBlock:"+6",dmg:1000,cancel:"SA2",guard:"上・弾",inv:"",notes:""},
  {id:"3884",name:"グランドショット",cmd:"236LP",attr:"必殺技",startup:14,active:"",recovery:"全体50",total:50,onHit:"-3",onBlock:"-7",dmg:600,cancel:"SA3",guard:"上・弾",inv:"",notes:""},
  {id:"3885",name:"ODグランドショット",cmd:"236P+P",attr:"必殺技",startup:12,active:"",recovery:"全体44",total:44,onHit:"D",onBlock:"-1",dmg:800,cancel:"SA2",guard:"上・弾",inv:"",notes:""},
  {id:"3886",name:"弱アッパーカット",cmd:"623LP",attr:"必殺技",startup:5,active:10,recovery:"35+着地後12",total:61,onHit:"D",onBlock:"-37",dmg:1100,cancel:"SA3",guard:"上",inv:"1-14F打撃・空弾無敵",notes:""},
  {id:"3887",name:"中アッパーカット",cmd:"623MP",attr:"必殺技",startup:10,active:10,recovery:"40+着地後15",total:74,onHit:"D",onBlock:"-45",dmg:1400,cancel:"SA3",guard:"上",inv:"1-13F打撃・空弾無敵",notes:""},
  {id:"3888",name:"強アッパーカット",cmd:"623HP",attr:"必殺技",startup:18,active:10,recovery:"40+着地後15",total:82,onHit:"D",onBlock:"-45",dmg:1600,cancel:"SA3",guard:"上",inv:"1-21F打撃・空弾無敵",notes:""},
  {id:"3889",name:"強アッパーカット(ホールド)",cmd:"623HPホールド",attr:"必殺技",startup:35,active:10,recovery:"40+着地後15",total:99,onHit:"D",onBlock:"-45",dmg:2800,cancel:"SA3",guard:"上",inv:"1-9F打撃・空弾無敵",notes:""},
  {id:"3890",name:"ODアッパーカット",cmd:"623P+P",attr:"必殺技",startup:8,active:12,recovery:"38+着地後15",total:72,onHit:"D",onBlock:"-43",dmg:1600,cancel:"",guard:"上",inv:"1-12F完全無敵",notes:""},
  {id:"3891",name:"弱ニークラッシュ",cmd:"236LK",attr:"必殺技",startup:14,active:11,recovery:18,total:42,onHit:"D",onBlock:"-8",dmg:800,cancel:"",guard:"上",inv:"",notes:""},
  {id:"3892",name:"中ニークラッシュ",cmd:"236MK",attr:"必殺技",startup:18,active:11,recovery:18,total:46,onHit:"D",onBlock:"-7",dmg:1000,cancel:"",guard:"上",inv:"",notes:""},
  {id:"3893",name:"強ニークラッシュ",cmd:"236HK",attr:"必殺技",startup:22,active:19,recovery:18,total:58,onHit:"D",onBlock:"-5",dmg:1400,cancel:"SA3",guard:"上",inv:"",notes:""},
  {id:"3894",name:"ODニークラッシュ",cmd:"236K+K",attr:"必殺技",startup:19,active:18,recovery:18,total:54,onHit:"D",onBlock:"-2",dmg:1600,cancel:"SA2",guard:"上",inv:"",notes:""},
  {id:"3895",name:"弱タイガーネクサス",cmd:"214LK",attr:"必殺技",startup:17,active:3,recovery:23,total:42,onHit:"+2",onBlock:"-5",dmg:500,cancel:"SA3",guard:"上",inv:"",notes:"マイト/グリード/ノヴァに派生可"},
  {id:"3896",name:"中タイガーネクサス",cmd:"214MK",attr:"必殺技",startup:20,active:3,recovery:23,total:45,onHit:"+2",onBlock:"-5",dmg:500,cancel:"SA3",guard:"上",inv:"",notes:"マイト/グリード/ノヴァに派生可"},
  {id:"3897",name:"強タイガーネクサス",cmd:"214HK",attr:"必殺技",startup:28,active:8,recovery:20,total:55,onHit:"+4",onBlock:"-3",dmg:500,cancel:"SA3",guard:"上",inv:"",notes:"マイト/グリード/ノヴァに派生可"},
  {id:"3898",name:"ODタイガーネクサス",cmd:"214K+K",attr:"必殺技",startup:23,active:8,recovery:20,total:50,onHit:"+4",onBlock:"-3",dmg:500,cancel:"SA2",guard:"上",inv:"",notes:"マイト/グリード/ノヴァに派生可"},
  {id:"3899",name:"タイガーマイト",cmd:"(ネクサス後)6LK",attr:"必殺技",startup:15,active:3,recovery:22,total:39,onHit:"+3",onBlock:"-5",dmg:800,cancel:"SA3",guard:"中",inv:"",notes:""},
  {id:"3901",name:"タイガーグリード",cmd:"(ネクサス後)6MK",attr:"必殺技",startup:17,active:3,recovery:17,total:36,onHit:"D",onBlock:"+4",dmg:1000,cancel:"SA3",guard:"上",inv:"",notes:""},
  {id:"3903",name:"タイガーノヴァ",cmd:"(ネクサス後)6HK",attr:"必殺技",startup:21,active:3,recovery:19,total:42,onHit:"D",onBlock:"+2",dmg:800,cancel:"SA3",guard:"上",inv:"",notes:""},
  {id:"3905",name:"SA1 タイガーキャノン",cmd:"236236P",attr:"SA",startup:13,active:"",recovery:"全体109",total:109,onHit:"D",onBlock:"-31",dmg:2200,cancel:"",guard:"上・弾",inv:"1-13F打撃・投げ無敵",notes:"最低保障30%"},
  {id:"3906",name:"SA2 サベージタイガー",cmd:"214214K",attr:"SA",startup:10,active:5,recovery:73,total:87,onHit:"",onBlock:"-58",dmg:500,cancel:"",guard:"上",inv:"1-14F完全無敵",notes:"最低保障40%"},
  {id:"3911",name:"SA3 タイガーヴァンキッシュ",cmd:"236236K",attr:"SA",startup:12,active:4,recovery:67,total:82,onHit:"D",onBlock:"-51",dmg:4000,cancel:"",guard:"上",inv:"1-15F完全無敵",notes:"最低保障50%"},
  {id:"3912",name:"CA タイガーヴァンキッシュ",cmd:"236236K(CA)",attr:"SA",startup:12,active:4,recovery:67,total:82,onHit:"D",onBlock:"-51",dmg:4500,cancel:"",guard:"上",inv:"1-15F完全無敵",notes:"最低保障50%"},
  {id:"3913",name:"タイガーハング",cmd:"N/6LP+LK",attr:"投げ",startup:5,active:3,recovery:23,total:30,onHit:"D",onBlock:"",dmg:1200,cancel:"",guard:"投",inv:"",notes:"パニカン時ダメージ2040"},
  {id:"3914",name:"タイガーキャリー",cmd:"4LP+LK",attr:"投げ",startup:5,active:3,recovery:23,total:30,onHit:"D",onBlock:"",dmg:1200,cancel:"",guard:"投",inv:"",notes:"パニカン時ダメージ2040"},
  {id:"3915",name:"前方ステップ",cmd:"66",attr:"ドライブ",startup:"",active:"",recovery:"全体23",total:23,onHit:"",onBlock:"",dmg:0,cancel:"",guard:"",inv:"",notes:""},
  {id:"3917",name:"ドライブインパクト",cmd:"HP+HK",attr:"ドライブ",startup:26,active:2,recovery:35,total:62,onHit:"D",onBlock:"-3",dmg:800,cancel:"",guard:"上",inv:"1-27Fアーマー×2",notes:"壁やられ発生"},
  {id:"3918",name:"ドライブリバーサル",cmd:"(ガード中)6HP+HK",attr:"ドライブ",startup:20,active:3,recovery:26,total:48,onHit:"D",onBlock:"-6",dmg:500,cancel:"",guard:"上",inv:"1-22F完全無敵",notes:"リカバリアブルダメージ"},
  {id:"3923",name:"パリィDR",cmd:"(パリィ中)66",attr:"ドライブ",startup:"",active:"",recovery:"全体45",total:45,onHit:"",onBlock:"",dmg:0,cancel:"※",guard:"",inv:"",notes:"暗転10F"},
  {id:"3924",name:"キャンセルDR",cmd:"(必殺中)66",attr:"ドライブ",startup:"",active:"",recovery:"全体46",total:46,onHit:"",onBlock:"",dmg:0,cancel:"※",guard:"",inv:"",notes:"暗転9F"},
]

const COMBO_SECTIONS = [
  { id:"small",    label:"小技始動",         icon:"👊" },
  { id:"medium",   label:"中技始動",         icon:"💢" },
  { id:"rush",     label:"ラッシュ中段始動", icon:"💨" },
  { id:"heavy",    label:"大攻撃始動",       icon:"⚡" },
  { id:"counter",  label:"カウンター",       icon:"🎯" },
  { id:"panish",   label:"パニカン",         icon:"💥" },
  { id:"impact",   label:"インパクト壁あて", icon:"🧱" },
  { id:"impactpc", label:"インパクトパニカン",icon:"🔥" },
  { id:"stun",     label:"スタン時",         icon:"⭐" },
  { id:"chip",     label:"削り",             icon:"🛡️" },
]

const ATTR_COLORS = {
  "通常":   "#e0c97f",
  "ジャンプ":"#7fc9e0",
  "特殊":   "#c97fe0",
  "必殺技": "#e07f7f",
  "SA":     "#ff6b35",
  "投げ":   "#7fe0a0",
  "ドライブ":"#7fa8e0",
}
const ATTR_ORDER = ["通常","ジャンプ","特殊","必殺技","SA","投げ","ドライブ"]

// ─────────────────────────────────────────────
// SUB COMPONENTS
// ─────────────────────────────────────────────
function FrameVal({ val }) {
  if (val === "" || val === undefined || val === null) return <span style={{color:"#444"}}>—</span>
  if (val === "D") return <span style={{color:"#60a5fa"}}>D</span>
  const n = parseInt(val)
  if (isNaN(n)) return <span style={{color:"#fbbf24"}}>{val}</span>
  if (n >= 3) return <span style={{color:"#4ade80"}}>{val}</span>
  if (n >= 0) return <span style={{color:"#facc15"}}>{val}</span>
  return <span style={{color:"#f87171"}}>{val}</span>
}

function Toast({ msg, type }) {
  if (!msg) return null
  const bg = type === "error" ? "#7f1d1d" : "#14532d"
  const border = type === "error" ? "#ef4444" : "#22c55e"
  return (
    <div style={{
      position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)",
      background:bg, border:`1px solid ${border}`, borderRadius:8,
      padding:"10px 20px", color:"#fff", fontSize:13, fontWeight:700,
      zIndex:9999, pointerEvents:"none", whiteSpace:"nowrap",
    }}>{msg}</div>
  )
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [sheet, setSheet] = useState("moves")
  const [attrFilter, setAttrFilter] = useState("全て")
  const [search, setSearch] = useState("")
  const [combos, setCombos] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState("list")
  const [builderSection, setBuilderSection] = useState(null)
  const [builderForm, setBuilderForm] = useState({ sequence:[], adv:"", oki:"", note:"", drive:"", sa:"" })
  const [editId, setEditId] = useState(null)
  const [paletteAttr, setPaletteAttr] = useState("通常")
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ msg:"", type:"ok" })
  const sectionRefs = useRef({})

  // ── Supabase: load all combos ──
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('combos')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) {
        showToast("データ読み込み失敗: " + error.message, "error")
      } else {
        const grouped = {}
        COMBO_SECTIONS.forEach(s => { grouped[s.id] = [] })
        data.forEach(row => {
          if (grouped[row.section]) grouped[row.section].push(row)
        })
        setCombos(grouped)
      }
      setLoading(false)
    }
    load()

    // Realtime subscription
    const channel = supabase
      .channel('combos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'combos' }, () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  function showToast(msg, type = "ok") {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg:"", type:"ok" }), 2500)
  }

  // ── Combo CRUD ──
  const saveCombo = useCallback(async () => {
    if (builderForm.sequence.length === 0 && !builderForm.note) return
    setSaving(true)
    const payload = {
      section:   builderSection,
      sequence:  builderForm.sequence,
      combo_str: builderForm.sequence.map(m => m.name).join(' → '),
      total_dmg: builderForm.sequence.reduce((s,m) => s + (m.dmg||0), 0),
      adv:   builderForm.adv,
      oki:   builderForm.oki,
      note:  builderForm.note,
      drive: builderForm.drive,
      sa:    builderForm.sa,
    }
    let error
    if (editId) {
      ;({ error } = await supabase.from('combos').update(payload).eq('id', editId))
    } else {
      ;({ error } = await supabase.from('combos').insert(payload))
    }
    setSaving(false)
    if (error) { showToast("保存失敗: " + error.message, "error"); return }
    showToast(editId ? "更新しました！" : "コンボを保存しました！")
    setPage("list")
    setSheet("combos")
  }, [builderSection, builderForm, editId])

  const deleteCombo = useCallback(async (rowId) => {
    const { error } = await supabase.from('combos').delete().eq('id', rowId)
    if (error) showToast("削除失敗", "error")
    else showToast("削除しました")
  }, [])

  // ── Builder helpers ──
  function openBuilder(sectionId, existingRow = null) {
    setBuilderSection(sectionId)
    if (existingRow) {
      setBuilderForm({
        sequence: existingRow.sequence || [],
        adv:   existingRow.adv   || "",
        oki:   existingRow.oki   || "",
        note:  existingRow.note  || "",
        drive: existingRow.drive || "",
        sa:    existingRow.sa    || "",
      })
      setEditId(existingRow.id)
    } else {
      setBuilderForm({ sequence:[], adv:"", oki:"", note:"", drive:"", sa:"" })
      setEditId(null)
    }
    setPaletteAttr("通常")
    setPage("builder")
  }

  const filteredMoves = MOVES.filter(m =>
    (attrFilter === "全て" || m.attr === attrFilter) &&
    (search === "" || m.name.includes(search) || m.cmd.includes(search))
  )

  const paletteMoves = MOVES.filter(m => m.attr === paletteAttr)

  // ══════════════════════════════════════════
  // BUILDER PAGE
  // ══════════════════════════════════════════
  if (page === "builder") {
    const sec = COMBO_SECTIONS.find(s => s.id === builderSection)
    const previewDmg = builderForm.sequence.reduce((s,m) => s + (m.dmg||0), 0)
    return (
      <div style={{ fontFamily:"'Noto Sans JP',sans-serif", background:"#0d0d12", minHeight:"100vh", color:"#e8e0d0" }}>
        {/* Header */}
        <div style={{ background:"linear-gradient(135deg,#1a0a00,#2d1500,#1a0a00)", borderBottom:"2px solid #c45f00", padding:"10px 14px", display:"flex", alignItems:"center", gap:10, position:"sticky", top:0, zIndex:100 }}>
          <button onClick={() => { setPage("list"); setSheet("combos") }} style={{ background:"#2a1500", border:"1px solid #c45f00", borderRadius:6, color:"#ff8c00", padding:"6px 14px", fontSize:13, cursor:"pointer", fontWeight:700 }}>← 戻る</button>
          <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:20, color:"#ff8c00", letterSpacing:2 }}>
            {sec?.icon} {sec?.label} — {editId ? "編集" : "コンボ追加"}
          </span>
        </div>

        {/* Sequence */}
        <div style={{ padding:"12px 14px", background:"#10101a", borderBottom:"1px solid #2a2a3a" }}>
          <div style={{ fontSize:11, color:"#c45f00", fontWeight:700, marginBottom:6 }}>コンボ手順（タップで削除）</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:36, alignItems:"center" }}>
            {builderForm.sequence.length === 0
              ? <span style={{ color:"#444", fontSize:12 }}>下のパレットから技をタップして追加…</span>
              : builderForm.sequence.map((m,i) => (
                  <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
                    {i > 0 && <span style={{ color:"#555" }}>→</span>}
                    <button onClick={() => setBuilderForm(f => ({ ...f, sequence: f.sequence.filter((_,j)=>j!==i) }))} style={{
                      background:"#2a1a00", border:"1px solid #c45f00", borderRadius:4,
                      color:"#ffd080", fontSize:12, padding:"4px 8px", cursor:"pointer", fontWeight:700,
                    }}>{m.name} <span style={{ color:"#666", fontSize:10 }}>✕</span></button>
                  </span>
                ))
            }
          </div>
          {builderForm.sequence.length > 0 && (
            <div style={{ marginTop:6, fontSize:11, color:"#888" }}>
              目安ダメージ: <span style={{ color:"#f0d080", fontWeight:700 }}>{previewDmg}</span>
              <span style={{ color:"#555", marginLeft:6 }}>（スケーリング前）</span>
              <button onClick={() => setBuilderForm(f => ({ ...f, sequence:[] }))} style={{ marginLeft:12, background:"none", border:"none", color:"#555", fontSize:11, cursor:"pointer" }}>全消去</button>
            </div>
          )}
        </div>

        {/* Palette tabs */}
        <div style={{ display:"flex", overflowX:"auto", gap:6, padding:"10px 14px", background:"#0f0f18", borderBottom:"1px solid #1e1e2a", scrollbarWidth:"none" }}>
          {ATTR_ORDER.map(a => (
            <button key={a} onClick={() => setPaletteAttr(a)} style={{
              padding:"6px 12px", borderRadius:4, whiteSpace:"nowrap", flexShrink:0,
              border: paletteAttr===a ? `2px solid ${ATTR_COLORS[a]}` : "1px solid #2a2a3a",
              background: paletteAttr===a ? `${ATTR_COLORS[a]}20` : "transparent",
              color: paletteAttr===a ? ATTR_COLORS[a] : "#777",
              fontSize:12, fontWeight:700, cursor:"pointer",
            }}>{a}</button>
          ))}
        </div>

        {/* Move palette */}
        <div style={{ padding:"10px 14px", display:"flex", flexWrap:"wrap", gap:8 }}>
          {paletteMoves.map(m => (
            <button key={m.id} onClick={() => setBuilderForm(f => ({ ...f, sequence:[...f.sequence,{id:m.id,name:m.name,cmd:m.cmd,dmg:m.dmg}] }))} style={{
              background:"#1a1020", border:`1px solid ${ATTR_COLORS[m.attr]||"#444"}55`,
              borderRadius:6, padding:"8px 10px", cursor:"pointer",
              color:"#e8d0b0", textAlign:"left", minWidth:88, position:"relative",
              WebkitTapHighlightColor:"transparent", userSelect:"none",
            }}
              onTouchStart={e=>e.currentTarget.style.background="#2a1a30"}
              onTouchEnd={e=>e.currentTarget.style.background="#1a1020"}
            >
              <div style={{ fontSize:12, fontWeight:700, marginBottom:2 }}>{m.name}</div>
              <div style={{ fontSize:10, color:ATTR_COLORS[m.attr]||"#888", fontFamily:"monospace" }}>{m.cmd}</div>
              <div style={{ fontSize:10, color:"#f0d080", marginTop:2 }}>{m.dmg||""}</div>
              {m.onHit && <div style={{ position:"absolute", top:4, right:6, fontSize:9 }}><FrameVal val={m.onHit}/></div>}
            </button>
          ))}
        </div>

        {/* Detail form */}
        <div style={{ padding:"14px 14px 40px" }}>
          <div style={{ fontSize:11, color:"#c45f00", fontWeight:700, marginBottom:10 }}>詳細情報</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            {[
              { key:"adv",   label:"有利フレーム",   ph:"+5 など" },
              { key:"drive", label:"ドライブゲージ",  ph:"1本 / 0.5本" },
              { key:"sa",    label:"SAゲージ必要数",  ph:"SA3 など" },
            ].map(f => (
              <div key={f.key}>
                <div style={{ fontSize:11, color:"#888", marginBottom:4 }}>{f.label}</div>
                <input value={builderForm[f.key]} onChange={e=>setBuilderForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                  style={{ width:"100%", background:"#1a1a24", border:"1px solid #333", borderRadius:4, color:"#e8e0d0", padding:"8px 10px", fontSize:12, boxSizing:"border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, color:"#888", marginBottom:4 }}>起き攻めリンク（URL or テキスト）</div>
            <input value={builderForm.oki} onChange={e=>setBuilderForm(p=>({...p,oki:e.target.value}))} placeholder="https://... または メモ"
              style={{ width:"100%", background:"#1a1a24", border:"1px solid #333", borderRadius:4, color:"#9dd0e8", padding:"8px 10px", fontSize:12, boxSizing:"border-box" }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:"#888", marginBottom:4 }}>備考</div>
            <textarea value={builderForm.note} onChange={e=>setBuilderForm(p=>({...p,note:e.target.value}))} placeholder="状況・条件・補足など" rows={2}
              style={{ width:"100%", background:"#1a1a24", border:"1px solid #333", borderRadius:4, color:"#e8e0d0", padding:"8px 10px", fontSize:12, boxSizing:"border-box", resize:"vertical" }} />
          </div>
          <button onClick={saveCombo} disabled={saving} style={{
            width:"100%", padding:"14px",
            background: saving ? "#555" : "linear-gradient(135deg,#c45f00,#ff8c00)",
            border:"none", borderRadius:6, color:"#fff", fontSize:15, fontWeight:700, cursor: saving ? "not-allowed" : "pointer",
          }}>
            {saving ? "保存中…" : editId ? "✏️ 更新する" : "💾 コンボを保存"}
          </button>
        </div>
        <Toast {...toast} />
      </div>
    )
  }

  // ══════════════════════════════════════════
  // MAIN PAGE
  // ══════════════════════════════════════════
  return (
    <div style={{ fontFamily:"'Noto Sans JP',sans-serif", background:"#0d0d12", minHeight:"100vh", color:"#e8e0d0" }}>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Bebas+Neue&display=swap'); * { box-sizing:border-box; } ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:#0d0d12} ::-webkit-scrollbar-thumb{background:#333;border-radius:2px}`}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#1a0a00,#2d1500,#1a0a00)", borderBottom:"2px solid #c45f00", padding:"10px 14px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:100 }}>
        <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:26, color:"#ff8c00", letterSpacing:3 }}>🐯 SAGAT SF6</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          {[{id:"moves",label:"📊 技データ"},{id:"combos",label:"⚡ コンボ"}].map(s=>(
            <button key={s.id} onClick={()=>setSheet(s.id)} style={{
              padding:"6px 14px", borderRadius:4,
              border: sheet===s.id ? "2px solid #ff8c00" : "1px solid #333",
              background: sheet===s.id ? "#c45f00" : "transparent",
              color: sheet===s.id ? "#fff" : "#888",
              fontWeight:700, cursor:"pointer", fontSize:12,
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* ── MOVES SHEET ── */}
      {sheet === "moves" && (
        <div style={{ padding:"12px 10px" }}>
          <div style={{ display:"flex", gap:8, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
            <input placeholder="技名 / コマンド検索…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ flex:1, minWidth:140, background:"#1a1a24", border:"1px solid #333", borderRadius:4, color:"#e8e0d0", padding:"7px 12px", fontSize:12 }} />
            <span style={{ color:"#555", fontSize:11 }}>{filteredMoves.length}件</span>
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
            {["全て",...ATTR_ORDER].map(a=>(
              <button key={a} onClick={()=>setAttrFilter(a)} style={{
                padding:"4px 9px", borderRadius:3,
                border: attrFilter===a ? `2px solid ${ATTR_COLORS[a]||"#ff8c00"}` : "1px solid #2a2a3a",
                background: attrFilter===a ? `${ATTR_COLORS[a]||"#ff8c00"}20` : "transparent",
                color: attrFilter===a ? (ATTR_COLORS[a]||"#ff8c00") : "#666",
                fontSize:11, fontWeight:700, cursor:"pointer",
              }}>{a}</button>
            ))}
          </div>
          <div style={{ overflowX:"auto", borderRadius:6, border:"1px solid #1e1e2a" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
              <thead>
                <tr style={{ background:"#1a1020", borderBottom:"2px solid #c45f00" }}>
                  {["技名","コマンド","属性","発生","持続","硬直","全体","HIT差","GRD差","ダメージ","無敵","備考"].map(h=>(
                    <th key={h} style={{ padding:"7px 8px", textAlign:"left", color:"#ff8c00", fontWeight:700, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMoves.map((m,i)=>(
                  <tr key={m.id} style={{ background:i%2===0?"#0f0f18":"#13131e", borderBottom:"1px solid #1a1a24" }}>
                    <td style={{ padding:"6px 8px", fontWeight:700, color:"#e8d0b0", whiteSpace:"nowrap" }}>{m.name}</td>
                    <td style={{ padding:"6px 8px", color:"#9dd0e8", fontFamily:"monospace", fontSize:10 }}>{m.cmd}</td>
                    <td style={{ padding:"6px 8px" }}>
                      <span style={{ padding:"2px 5px", borderRadius:3, background:`${ATTR_COLORS[m.attr]||"#888"}22`, color:ATTR_COLORS[m.attr]||"#888", fontSize:10, fontWeight:700 }}>{m.attr}</span>
                    </td>
                    <td style={{ padding:"6px 8px", textAlign:"center" }}>{m.startup||"—"}</td>
                    <td style={{ padding:"6px 8px", textAlign:"center" }}>{m.active||"—"}</td>
                    <td style={{ padding:"6px 8px", textAlign:"center", color:"#888", fontSize:10 }}>{m.recovery||"—"}</td>
                    <td style={{ padding:"6px 8px", textAlign:"center" }}>{m.total||"—"}</td>
                    <td style={{ padding:"6px 8px", textAlign:"center" }}><FrameVal val={m.onHit}/></td>
                    <td style={{ padding:"6px 8px", textAlign:"center" }}><FrameVal val={m.onBlock}/></td>
                    <td style={{ padding:"6px 8px", textAlign:"right", color:"#f0d080" }}>{m.dmg||"—"}</td>
                    <td style={{ padding:"6px 8px", color:"#e07070", fontSize:10 }}>{m.inv||"—"}</td>
                    <td style={{ padding:"6px 8px", color:"#777", fontSize:10, maxWidth:160 }}>{m.notes||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── COMBOS SHEET ── */}
      {sheet === "combos" && (
        <div style={{ padding:"12px 10px" }}>
          {/* Section nav */}
          <div style={{ display:"flex", overflowX:"auto", gap:6, paddingBottom:10, scrollbarWidth:"none" }}>
            {COMBO_SECTIONS.map(s=>(
              <button key={s.id} onClick={()=>sectionRefs.current[s.id]?.scrollIntoView({behavior:"smooth",block:"start"})} style={{
                padding:"5px 11px", borderRadius:4, whiteSpace:"nowrap",
                border:"1px solid #333", background:"#1a1020",
                color:"#aaa", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0,
              }}>{s.icon} {s.label}</button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign:"center", padding:40, color:"#555" }}>読み込み中…</div>
          ) : (
            COMBO_SECTIONS.map(section => {
              const rows = combos[section.id] || []
              return (
                <div key={section.id} ref={el=>sectionRefs.current[section.id]=el} style={{ marginBottom:36 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, paddingBottom:6, borderBottom:"2px solid #c45f00" }}>
                    <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:20, color:"#ff8c00", letterSpacing:2 }}>{section.icon} {section.label}</span>
                    <span style={{ color:"#555", fontSize:11 }}>{rows.length}件</span>
                    <button onClick={()=>openBuilder(section.id)} style={{
                      marginLeft:"auto", padding:"6px 14px",
                      background:"linear-gradient(135deg,#1a2a00,#2a4000)",
                      border:"1px solid #4a8a4a", borderRadius:5,
                      color:"#8ada8a", fontSize:12, fontWeight:700, cursor:"pointer",
                    }}>＋ コンボ追加</button>
                  </div>

                  {rows.length === 0 ? (
                    <div style={{ textAlign:"center", padding:20, color:"#333", fontSize:12, border:"1px dashed #222", borderRadius:6 }}>
                      「＋ コンボ追加」で記録を始めよう
                    </div>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {rows.map(row => (
                        <div key={row.id} style={{ background:"#13131e", border:"1px solid #2a2a3a", borderRadius:8, padding:"12px 14px" }}>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:8, alignItems:"center" }}>
                            {(row.sequence||[]).map((m,i) => (
                              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:3 }}>
                                {i > 0 && <span style={{ color:"#444", fontSize:12 }}>→</span>}
                                <span style={{ background:"#1e1428", border:"1px solid #3a2a4a", borderRadius:4, padding:"3px 7px", fontSize:11, color:"#d0b0f0", fontWeight:700 }}>{m.name}</span>
                              </span>
                            ))}
                            {!row.sequence?.length && <span style={{ color:"#c0a060", fontSize:12, fontWeight:700 }}>{row.combo_str}</span>}
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:12, fontSize:11 }}>
                            {row.total_dmg > 0 && <span>💥 <span style={{ color:"#f0d080", fontWeight:700 }}>{row.total_dmg}</span></span>}
                            {row.adv && <span>⏱ 有利: <span style={{ color:row.adv.startsWith("+")?"#4ade80":row.adv.startsWith("-")?"#f87171":"#fbbf24", fontWeight:700 }}>{row.adv}</span></span>}
                            {row.drive && <span>🔵 DR: <span style={{ color:"#7fa8e0" }}>{row.drive}</span></span>}
                            {row.sa && <span>⭐ SA: <span style={{ color:"#ff8c00" }}>{row.sa}</span></span>}
                          </div>
                          {row.oki && <div style={{ marginTop:6, fontSize:11, color:"#9dd0e8" }}>
                            🔗 起き攻め: {row.oki.startsWith("http") ? <a href={row.oki} target="_blank" rel="noopener noreferrer" style={{ color:"#9dd0e8" }}>{row.oki}</a> : row.oki}
                          </div>}
                          {row.note && <div style={{ marginTop:4, fontSize:11, color:"#888" }}>📝 {row.note}</div>}
                          <div style={{ display:"flex", gap:8, marginTop:10 }}>
                            <button onClick={()=>openBuilder(section.id, row)} style={{ padding:"4px 12px", background:"#1e2a1e", border:"1px solid #4a6a4a", borderRadius:4, color:"#8ada8a", fontSize:11, cursor:"pointer" }}>✏️ 編集</button>
                            <button onClick={()=>deleteCombo(row.id)} style={{ padding:"4px 12px", background:"#2a1010", border:"1px solid #6a3a3a", borderRadius:4, color:"#f87171", fontSize:11, cursor:"pointer" }}>🗑 削除</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
      <Toast {...toast} />
    </div>
  )
}
