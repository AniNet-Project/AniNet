/*
Implement the Parser of a Simple Edge Markup Language(SEML).

The synatax like these:

1. For undirected edges:

Dio-敌人-承太郎
花京院-朋友-承太郎

2. For directed edges:

乔瑟夫-祖父->承太郎
承太郎<-父亲-徐伦

3. explicit query type:

(id:1)-朋友-(id:2)

*/

import * as P from 'parsimmon'


type QueryHint = string
export type QueryEdge = {
  label: string,
  from: QueryHint,
  to: QueryHint,
  directed: boolean,
}

const puncs = "\/,\.·!@#$%^&*！？｡＂＃＄％＆＇（）＊＋，－／：；＜＝＞＠［＼］＾＿｀｛｜｝～｟｠｢｣､、〃》「」『』【】〔〕〖〗〘〙〚〛〜〝〞〟〰〾〿–—‘’‛“”„‟…‧﹏.	"
const symbols = new RegExp("[a-zA-Z0-9\u4e00-\u9fa5"+puncs+"]+")

const Label: P.Parser<QueryHint> =
  P.regexp(symbols)
   .map(s => s)

const ExplicitLabel: P.Parser<QueryHint> =
  P.seq(P.string("(label:"), Label, P.string(")"))
   .map(
     ([_l, label, _r]) => label
   )

const ExplicitID: P.Parser<QueryHint> =
  P.seq(P.string("(id:"), P.regex(/[0-9]+/), P.string(")"))
   .map(
     ([_l, id, _r]) => "id:"+id
   )

const Obj: P.Parser<QueryHint> =
  P.alt(
    ExplicitLabel,
    ExplicitID,
    Label,
  )


const dash = P.regex(/-+/)
const rightArrow = P.seq(dash, P.string(">"))
const leftArrow = P.seq(P.string("<"), dash)


const EdgeLabel = P.alt(

  P.seq(
    P.string("("),
    P.alt(Label, P.string("")),
    P.string(")"))
  .map(([_l, l, _r]) => l),

  Label,
)


const UndirectedEdge: P.Parser<QueryEdge> = 
  P.seq(Obj, dash, EdgeLabel, dash, Obj)
   .map(
     ([left, _1, label, _2, right]) => {
       return {
         label: label,
         from: left,
         to: right,
         directed: false
       }
     }
   )

const DirectedRightEdge: P.Parser<QueryEdge> = 
  P.seq(Obj, dash, EdgeLabel, rightArrow, Obj)
   .map(
     ([left, _1, label, _2, right]) => {
       return {
         label: label,
         from: left,
         to: right,
         directed: true
       }
     }
   )

const DirectedLeftEdge: P.Parser<QueryEdge> = 
  P.seq(Obj, leftArrow, EdgeLabel, dash, Obj)
   .map(
     ([left, _1, label, _2, right]) => {
       return {
         label: label,
         from: right,
         to: left,
         directed: true
       }
     }
   )

const LineParser: P.Parser<QueryEdge> =
  P.seq(
    P.regex(/[ \t]*/),
    P.alt(
      UndirectedEdge,
      DirectedLeftEdge,
      DirectedRightEdge,
    ),
    P.regex(/[ \t]*/),
  )
  .map(
    ([_l, e, _r]) => e
  )

export {LineParser}
