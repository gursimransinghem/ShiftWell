import { useState, useEffect, useRef, useCallback } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '@/src/components/ui/Button';
import OptionCard from '@/src/components/ui/OptionCard';
import ProgressBar from '@/src/components/ui/ProgressBar';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { useUserStore } from '@/src/store/user-store';
import type { Chronotype } from '@/src/lib/circadian/types';

interface Question {
  id: number;
  text: string;
  options: { label: string; score: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'What time would you naturally wake up if you had no obligations?',
    options: [
      { label: 'Before 6am', score: 4 },
      { label: '6 \u2013 7:30am', score: 3 },
      { label: '7:30 \u2013 9am', score: 2 },
      { label: 'After 9am', score: 1 },
    ],
  },
  {
    id: 2,
    text: 'How alert do you feel in the first 30 minutes after waking?',
    options: [
      { label: 'Very alert', score: 4 },
      { label: 'Fairly alert', score: 3 },
      { label: 'Not very alert', score: 2 },
      { label: 'Not at all alert', score: 1 },
    ],
  },
  {
    id: 3,
    text: 'When do you feel your best for focused mental work?',
    options: [
      { label: 'Morning', score: 4 },
      { label: 'Late morning', score: 3 },
      { label: 'Afternoon', score: 2 },
      { label: 'Evening', score: 1 },
    ],
  },
  {
    id: 4,
    text: 'If you had to take a 2-hour exam, when would you choose?',
    options: [
      { label: '8 \u2013 10am', score: 4 },
      { label: '11am \u2013 1pm', score: 3 },
      { label: '3 \u2013 5pm', score: 2 },
      { label: '7 \u2013 9pm', score: 1 },
    ],
  },
  {
    id: 5,
    text: 'At what time do you feel tired enough to go to sleep?',
    options: [
      { label: 'Before 9pm', score: 4 },
      { label: '9 \u2013 10:30pm', score: 3 },
      { label: '10:30pm \u2013 12am', score: 2 },
      { label: 'After midnight', score: 1 },
    ],
  },
];

function scoreToChronotype(totalScore: number): Chronotype {
  if (totalScore >= 15) return 'early';
  if (totalScore >= 10) return 'intermediate';
  return 'late';
}

function chronotypeLabel(type: Chronotype): string {
  switch (type) {
    case 'early':
      return 'Early Bird';
    case 'intermediate':
      return 'Intermediate';
    case 'late':
      return 'Night Owl';
  }
}

function chronotypeDescription(type: Chronotype): string {
  switch (type) {
    case 'early':
      return 'You naturally wake up early and feel most alert in the morning. Your circadian rhythm favors earlier sleep and wake times.';
    case 'intermediate':
      return 'You have a flexible circadian rhythm that adapts well to different schedules. Most people fall into this category.';
    case 'late':
      return 'You naturally stay up late and feel most alert in the evening. Your circadian rhythm favors later sleep and wake times.';
  }
}

export default function ChronotypeScreen() {
  const setProfile = useUserStore((s) => s.setProfile);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(QUESTIONS.length).fill(null),
  );
  const [showResult, setShowResult] = useState(false);

  // Question transition animation
  const questionOpacity = useRef(new Animated.Value(1)).current;
  const questionTranslateY = useRef(new Animated.Value(0)).current;

  // Result emoji scale bounce
  const emojiScale = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;

  const question = QUESTIONS[currentQuestion];
  const selectedScore = answers[currentQuestion];

  const totalScore = answers.reduce<number>((sum, a) => sum + (a ?? 0), 0);
  const chronotype = scoreToChronotype(totalScore);

  // Animate question transition
  const animateQuestionIn = useCallback(() => {
    questionOpacity.setValue(0);
    questionTranslateY.setValue(12);
    Animated.parallel([
      Animated.timing(questionOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(questionTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [questionOpacity, questionTranslateY]);

  const animateQuestionOut = useCallback(
    (onDone: () => void) => {
      Animated.parallel([
        Animated.timing(questionOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(questionTranslateY, {
          toValue: -8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => onDone());
    },
    [questionOpacity, questionTranslateY],
  );

  // Animate result screen entrance
  useEffect(() => {
    if (showResult) {
      resultOpacity.setValue(0);
      emojiScale.setValue(0.3);
      Animated.parallel([
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(emojiScale, {
            toValue: 1.15,
            speed: 14,
            bounciness: 12,
            useNativeDriver: true,
          }),
          Animated.spring(emojiScale, {
            toValue: 1,
            speed: 20,
            bounciness: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [showResult, emojiScale, resultOpacity]);

  // Trigger entrance animation on question change
  useEffect(() => {
    animateQuestionIn();
  }, [currentQuestion, animateQuestionIn]);

  function selectOption(score: number) {
    const next = [...answers];
    next[currentQuestion] = score;
    setAnswers(next);
  }

  function handleNext() {
    if (currentQuestion < QUESTIONS.length - 1) {
      animateQuestionOut(() => {
        setCurrentQuestion(currentQuestion + 1);
      });
    } else {
      setProfile({ chronotype });
      setShowResult(true);
    }
  }

  function handleBack() {
    if (showResult) {
      setShowResult(false);
    } else if (currentQuestion > 0) {
      animateQuestionOut(() => {
        setCurrentQuestion(currentQuestion - 1);
      });
    }
  }

  if (showResult) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ProgressBar currentStep={2} totalSteps={4} />
          </View>

          <Animated.View style={[styles.resultContainer, { opacity: resultOpacity }]}>
            <Animated.Text
              style={[styles.resultEmoji, { transform: [{ scale: emojiScale }] }]}
            >
              {chronotype === 'early'
                ? '\u{1F305}'
                : chronotype === 'late'
                  ? '\u{1F319}'
                  : '\u{2600}\uFE0F'}
            </Animated.Text>
            <Text style={styles.resultTitle}>
              You're {chronotype === 'intermediate' ? 'an' : 'a'}{' '}
              {chronotypeLabel(chronotype)}
            </Text>
            <Text style={styles.resultDescription}>
              {chronotypeDescription(chronotype)}
            </Text>
          </Animated.View>

          <View style={styles.footer}>
            <Button
              title="Continue"
              onPress={() => router.push('/(onboarding)/household')}
              size="lg"
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ProgressBar currentStep={2} totalSteps={4} />
        </View>

        <Animated.View
          style={{
            opacity: questionOpacity,
            transform: [{ translateY: questionTranslateY }],
          }}
        >
          <Text style={styles.sectionTitle}>Chronotype Quiz</Text>
          <Text style={styles.questionCounter}>
            Question {currentQuestion + 1} of {QUESTIONS.length}
          </Text>
          <Text style={styles.questionText}>{question.text}</Text>

          <View style={styles.options}>
            {question.options.map((option) => (
              <OptionCard
                key={option.label}
                title={option.label}
                selected={selectedScore === option.score}
                onPress={() => selectOption(option.score)}
              />
            ))}
          </View>
        </Animated.View>

        <View style={styles.navRow}>
          {currentQuestion > 0 && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="secondary"
              size="md"
            />
          )}
          <View style={styles.navSpacer} />
          <Button
            title={
              currentQuestion < QUESTIONS.length - 1
                ? 'Next'
                : 'See Results'
            }
            onPress={handleNext}
            disabled={selectedScore === null}
            size="md"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING['3xl'],
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  questionCounter: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.xl,
  },
  questionText: {
    ...TYPOGRAPHY.heading3,
    color: COLORS.text.primary,
    marginBottom: SPACING['2xl'],
    lineHeight: 32,
  },
  options: {
    gap: SPACING.md,
    marginBottom: SPACING['3xl'],
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  navSpacer: {
    flex: 1,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING['4xl'],
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: SPACING['2xl'],
  },
  resultTitle: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  resultDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  footer: {
    marginTop: 'auto',
  },
});
