import { randomString, isValidTarget } from './Utility';
import { FitnessFunctions } from './FitnessFunctions';

const ALL_CHARACTERS =
  "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわをん" +
  "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヲンヴ" +
  "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ" +
  "　" +
  "０１２３４５６７８９" +
  "！”＃＄％＆’（）＊＋，－．／：；＜＝＞？＠［￥］＾＿｀｛｜｝～";

export class GeneticAlgorithm {
  target: string;
  chars: string;
  populationSize: number;
  mutationRate: number;
  generations: number;
  fitnessFunction: string;
  population: string[];
  found: boolean;
  generationCount: number;
  logHistory: string[];
  onUpdate: (generationCount: number, bestFitness: number) => void;
  isRunning: boolean;

  constructor() {
    this.target = "";
    this.chars = ALL_CHARACTERS;
    this.populationSize = 200;
    this.mutationRate = 0.01;
    this.generations = 10000;
    this.fitnessFunction = "basic";
    this.population = [];
    this.found = false;
    this.generationCount = 0;
    this.logHistory = [];
    this.onUpdate = () => { }; // デフォルトの空関数を追加
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    this.target = (document.getElementById('target') as HTMLInputElement).value;
    this.chars = (document.getElementById('chars') as HTMLTextAreaElement).value;
    this.populationSize = parseInt((document.getElementById('populationSize') as HTMLInputElement).value);
    this.mutationRate = parseFloat((document.getElementById('mutationRate') as HTMLInputElement).value);
    this.generations = parseInt((document.getElementById('generations') as HTMLInputElement).value);
    this.fitnessFunction = (document.getElementById('fitnessFunction') as HTMLSelectElement).value;
    const errorMessage = document.getElementById('error-message') as HTMLParagraphElement;

    // 入力バリデーション
    if (!isValidTarget(this.target, this.chars)) {
      errorMessage.style.display = 'block';
      return;
    } else {
      errorMessage.style.display = 'none';
    }

    this.population = [];
    this.found = false;
    this.generationCount = 0;
    this.logHistory = [];

    this.population = [];
    this.found = false;
    this.generationCount = 0;
    this.logHistory = [];

    // 初期集団を生成
    for (let i = 0; i < this.populationSize; i++) {
      this.population.push(randomString(this.target.length, this.chars));
    }

    this.evolve();
  }

  stop() {
    this.isRunning = false;
  }

  fitness(individual: string): number {
    switch (this.fitnessFunction) {
      case 'position':
        return FitnessFunctions.fitnessWithPosition(individual, this.target);
      case 'levenshtein':
        return FitnessFunctions.fitnessWithLevenshtein(individual, this.target);
      case 'commonSubsequence':
        return FitnessFunctions.fitnessWithCommonSubsequence(individual, this.target);
      case 'jaccard':
        return FitnessFunctions.fitnessWithJaccard(individual, this.target);
      case 'combined':
        return FitnessFunctions.combinedFitness(individual, this.target);
      default:
        return FitnessFunctions.basicFitness(individual, this.target);
    }
  }

  mutate(individual: string): { individual: string, mutations: number } {
    let result = '';
    let mutationCount = 0;
    for (let i = 0; i < individual.length; i++) {
      if (Math.random() < this.mutationRate) {
        result += this.chars.charAt(Math.floor(Math.random() * this.chars.length));
        mutationCount++;
      } else {
        result += individual.charAt(i);
      }
    }
    return { individual: result, mutations: mutationCount };
  }

  crossover(parent1: string, parent2: string): string {
    const minLength = Math.min(parent1.length, parent2.length);
    const midpoint = Math.floor(Math.random() * minLength);
    return parent1.slice(0, midpoint) + parent2.slice(midpoint);
  }

  evolve() {
    if (!this.isRunning) {
      return;
    }

    const matingPool: string[] = [];
    let totalMutations = 0;

    // 全個体のフィットネススコアを取得
    const fitnessScores = this.population.map(individual => this.fitness(individual));

    // 最小フィットネススコアを設定
    const minFitness = Math.min(...fitnessScores);
    const adjustedFitnessScores = fitnessScores.map(score => score - minFitness + 1);

    // フィットネススコアを用いて交配プールを作成
    for (let i = 0; i < this.population.length; i++) {
      const fitnessScore = adjustedFitnessScores[i];
      const n = Math.floor(fitnessScore * 10); // フィットネススコアに応じて確率を調整
      for (let j = 0; j < n; j++) {
        matingPool.push(this.population[i]);
      }
    }

    // matingPoolが空の場合、進化を停止
    if (matingPool.length === 0) {
      console.error("Mating pool is empty. Evolution cannot proceed.");
      return;
    }

    // 次世代を生成
    const newPopulation: string[] = [];
    for (let i = 0; i < this.populationSize; i++) {
      const parent1 = matingPool[Math.floor(Math.random() * matingPool.length)];
      const parent2 = matingPool[Math.floor(Math.random() * matingPool.length)];
      let child = this.crossover(parent1, parent2);
      const mutationResult = this.mutate(child);
      newPopulation.push(mutationResult.individual);
      totalMutations += mutationResult.mutations;
    }

    this.population = newPopulation;
    this.generationCount++;
    const bestIndividual = this.population.reduce((a, b) => (this.fitness(a) > this.fitness(b) ? a : b));

    // 出力
    const logItem = `${this.generationCount}. 最良: ${this.highlightMatches(bestIndividual)}, 適応度: ${this.fitness(bestIndividual).toFixed(4)}, 突然変異: ${totalMutations}個`;
    this.logHistory.push(logItem);
    (document.getElementById('output') as HTMLElement).innerHTML = logItem;

    // ログ履歴を更新
    this.updateLogHistory();

    // グラフを更新
    this.onUpdate(this.generationCount, this.fitness(bestIndividual));

    if (bestIndividual === this.target || this.generationCount >= this.generations) {
      this.found = true;
    }

    if (!this.found) {
      requestAnimationFrame(this.evolve.bind(this));
    }
  }

  highlightMatches(individual: string): string {
    let result = '';
    for (let i = 0; i < individual.length; i++) {
      if (individual.charAt(i) === this.target.charAt(i)) {
        result += `<span class="matched">${individual.charAt(i)}</span>`;
      } else {
        result += individual.charAt(i);
      }
    }
    return result;
  }

  updateLogHistory() {
    const logContainer = document.getElementById('log') as HTMLElement;
    logContainer.innerHTML = this.logHistory.slice().reverse().map(item => `<div class="log-item">${item}</div>`).join('');
  }
}