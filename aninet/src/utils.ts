
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


export {exportToJson, shorterString}
