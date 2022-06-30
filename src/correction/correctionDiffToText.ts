import { Form, Question } from '../form/form'
import { Answer } from '../form/validateResponse'
import { CorrectionDiff, QuestionCorrectionDiff } from './correctionDiff'

const answerToString = (question: Question, answer: Answer): string => {
	if (Array.isArray(answer)) {
		switch (question.format.type) {
			case 'multi-select':
			case 'single-select':
				return answer.join(', ')
			case 'positive-integer':
			case 'non-negative-integer':
			default:
				return answer.join(' ')
		}
	}
	switch (question.format.type) {
		case 'email':
		case 'text':
			return answer
	}
	return JSON.stringify(answer)
}

const questionDiffToString = (
	question: Question,
	diff: CorrectionDiff,
): string => {
	if ('old' in diff && 'new' in diff)
		return [
			`  OLD: ${answerToString(question, diff.old)}`,
			`  NEW: ${answerToString(question, diff.new)}`,
		].join('\n')
	if ('unset' in diff) return `  DEL: ${answerToString(question, diff.unset)}`
	if ('set' in diff) return `  NEW: ${answerToString(question, diff.set)}`
	return `  ??: ${JSON.stringify(diff)}`
}

export const correctionDiffToText = (
	form: Form,
	diff: QuestionCorrectionDiff,
): string => {
	const text: string[] = []
	Object.entries(diff).forEach(([sectionId, questions]) =>
		Object.entries(questions).forEach(([questionId, questionDiff]) => {
			const section = form.sections.find(({ id }) => id === sectionId)
			const question = section?.questions.find(({ id }) => id === questionId)
			text.push(
				[
					`- ${section?.title ?? sectionId}: ${question?.title ?? questionId}`,
					questionDiffToString(
						question ?? {
							id: questionId,
							format: {
								type: 'text',
							},
							title: questionId,
						},
						questionDiff,
					),
					``,
				].join('\n'),
			)
		}),
	)

	return text.join('\n')
}
