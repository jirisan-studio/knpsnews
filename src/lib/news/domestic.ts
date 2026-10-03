// The SQL migration uses these same expressions for existing stored articles.
export const FOREIGN_PARK_PATTERN = '해외|외국|미국|하와이|옐로스톤|요세미티|그랜드[ ]*캐니언|세쿼이아|브라이스|자이언|캐나다|밴프|재스퍼|영국|프랑스|독일|스페인|이탈리아|스위스|노르웨이|아이슬란드|유럽|일본|후지산|중국|장가계|태국|베트남|인도네시아|말레이시아|필리핀|캄보디아|라오스|네팔|히말라야|호주|오스트레일리아|뉴질랜드|아프리카|케냐|탄자니아|세렝게티|마사이[ ]*마라|크루거|남아공|브라질|아르헨티나|칠레|페루|멕시코|코스타리카|파타고니아|갈라파고스|북미|남미|북한|금강산|백두산';
export const DOMESTIC_PARK_PATTERN = '국립공원공단|국립공원관리공단|국립공원연구원|야생생물보전원|지리산|설악산|북한산|한려해상|다도해해상|태안해안|한라산|경주국립공원|계룡산|속리산|내장산|가야산|덕유산|오대산|주왕산|치악산|월악산|소백산|변산반도|월출산|무등산|태백산|팔공산|금정산|국내[ ]*국립공원|우리나라[ ]*국립공원';

export function isDomesticParkNews(article: {title:string;summary:string}) {
  const text=`${article.title} ${article.summary}`;
  // Preserve comparisons involving a domestic park; collecting keywords are not evidence.
  return !new RegExp(FOREIGN_PARK_PATTERN,'i').test(text) || new RegExp(DOMESTIC_PARK_PATTERN,'i').test(text);
}
