import { ItemInfo, NodeType, EdgeType } from "./datatypes";

const exportToJson = (objectData: any, fileName: string) => {
  let contentType = "application/json;charset=utf-8;";
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(objectData)))], { type: contentType });
    navigator.msSaveOrOpenBlob(blob, fileName);
  } else {
    var a = document.createElement('a');
    a.download = fileName;
    a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(objectData, null, 2));
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}


const shorterString = (str: string, limit: number) => {
  let res = "" + str
  if (str.length > limit) {
    res = str.slice(0, limit) 
    res += "..."
  }
  return res
}

const mergeInfo = (info_a: ItemInfo, info_b: ItemInfo) => {
  let new_ = Object.assign({}, info_a)
  for (const [k, v] of Object.entries(info_b.categories)) {
    new_.categories[k] = v
  }
  let nodes: Record<number, NodeType> = {} 
  for (const n of info_a.data.nodes.concat(info_b.data.nodes)) {
    nodes[n.id] = n;
  }
  let edges: Record<number, EdgeType> = {} 
  for (const e of info_a.data.edges.concat(info_b.data.edges)) {
    edges[e.id] = e;
  }
  new_.data.nodes = []
  for (const n of Object.values(nodes)) {new_.data.nodes.push(n)}
  new_.data.edges = []
  for (const e of Object.values(edges)) {new_.data.edges.push(e)}
  return new_
}


export {exportToJson, shorterString, mergeInfo}
