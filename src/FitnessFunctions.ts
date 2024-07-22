export class FitnessFunctions {
    static basicFitness(individual: string, target: string): number {
        let score = 0;
        for (let i = 0; i < individual.length; i++) {
            if (individual[i] === target[i]) {
                score++;
            }
        }
        return score;
    }

    static fitnessWithPosition(individual: string, target: string): number {
        let score = 0;
        for (let i = 0; i < individual.length; i++) {
            if (individual[i] === target[i]) {
                score++;
            }
        }
        return score;
    }

    static fitnessWithLevenshtein(individual: string, target: string): number {
        const getLevenshteinDistance = (a: string, b: string): number => {
            const matrix: number[][] = [];
            for (let i = 0; i <= b.length; i++) {
                matrix[i] = [i];
            }
            for (let j = 0; j <= a.length; j++) {
                matrix[0][j] = j;
            }
            for (let i = 1; i <= b.length; i++) {
                for (let j = 1; j <= a.length; j++) {
                    if (b.charAt(i - 1) === a.charAt(j - 1)) {
                        matrix[i][j] = matrix[i - 1][j - 1];
                    } else {
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j - 1] + 1,
                            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                        );
                    }
                }
            }
            return matrix[b.length][a.length];
        };
        return 1 / (1 + getLevenshteinDistance(individual, target));
    }

    static fitnessWithCommonSubsequence(individual: string, target: string): number {
        const getCommonSubsequenceLength = (a: string, b: string): number => {
            const lengths: number[][] = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(0));
            for (let i = 1; i <= a.length; i++) {
                for (let j = 1; j <= b.length; j++) {
                    if (a[i - 1] === b[j - 1]) {
                        lengths[i][j] = lengths[i - 1][j - 1] + 1;
                    } else {
                        lengths[i][j] = Math.max(lengths[i - 1][j], lengths[i][j - 1]);
                    }
                }
            }
            return lengths[a.length][b.length];
        };
        return getCommonSubsequenceLength(individual, target);
    }

    static fitnessWithJaccard(individual: string, target: string): number {
        const setA = new Set(individual.split(''));
        const setB = new Set(target.split(''));
        const intersection = new Set([...setA].filter(x => setB.has(x)));
        const union = new Set([...setA, ...setB]);
        const jaccardIndex = intersection.size / union.size;

        // 文字の位置に基づくペナルティを追加
        let positionPenalty = 0;
        for (let i = 0; i < Math.min(individual.length, target.length); i++) {
            if (individual[i] !== target[i]) {
                positionPenalty++;
            }
        }

        // フィットネススコアを計算（Jaccard係数 - ペナルティ）
        return jaccardIndex - (positionPenalty / target.length);
    }

    static combinedFitness(individual: string, target: string): number {
        const jaccardScore = FitnessFunctions.fitnessWithJaccard(individual, target);
        const basicScore = FitnessFunctions.basicFitness(individual, target);
        return (jaccardScore + basicScore) / 2;
    }
}