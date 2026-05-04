'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSurveyStore } from '@/lib/storage/survey-store';
import { validateCode } from '@/lib/validation/code';

type IntroScreen = 'welcome' | 'code' | 'consents';

export function IntroBlock() {
  const router = useRouter();
  const { setCode, setConsents, markBlockComplete, goToBlock } = useSurveyStore();

  const [screen, setScreen] = useState<IntroScreen>('welcome');
  const [codeValue, setCodeValue] = useState('');
  const [touched, setTouched] = useState(false);
  const [dataProcessing, setDataProcessing] = useState(false);
  const [selfCompletion, setSelfCompletion] = useState(false);

  const validation = validateCode(codeValue);
  const codeError = touched && !validation.valid ? validation.error : null;

  const handleCodeNext = () => {
    if (!validation.valid) return;
    setCode(codeValue);
    setScreen('consents');
  };

  const handleStart = () => {
    setConsents({ dataProcessing: true, selfCompletion: true });
    markBlockComplete('intro');
    goToBlock('basic');
    router.push('/survey/basic');
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {screen === 'welcome' && (
        <div
          key="welcome"
          className="flex flex-col gap-6 opacity-100 transition-opacity duration-200"
        >
          <h1 className="text-2xl font-semibold">Перш ніж почати</h1>
          <p className="text-muted-foreground leading-relaxed">
            Ця анкета допоможе скласти професійний профіль на основі ваших звичок, досвіду та
            підходу до робочих задач. Проходження триватиме приблизно 30-40 хвилин. Будь ласка,
            виділіть час, коли вас не відволікатимуть.
          </p>
          <Alert>
            <AlertDescription>
              У анкеті є питання-перевірки уваги. Відповідайте уважно та чесно — це дасть точніший
              результат.
            </AlertDescription>
          </Alert>
          <div className="mt-auto">
            <Button onClick={() => setScreen('code')}>Далі</Button>
          </div>
        </div>
      )}

      {screen === 'code' && (
        <div key="code" className="flex flex-col gap-6 opacity-100 transition-opacity duration-200">
          <h1 className="text-2xl font-semibold">Ваш код</h1>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="code-input">Код учасника</Label>
            <Input
              id="code-input"
              placeholder="Введіть код"
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value)}
              onBlur={() => setTouched(true)}
              aria-invalid={codeError !== null}
              aria-describedby={codeError !== null ? 'code-error' : 'code-hint'}
            />
            {codeError !== null ? (
              <p id="code-error" className="text-sm text-destructive">
                {codeError}
              </p>
            ) : (
              <p id="code-hint" className="text-xs text-muted-foreground">
                Запам&apos;ятайте цей код — за ним ви зможете звернутися за результатом. Не вводьте
                своє ім&apos;я або прізвище.
              </p>
            )}
          </div>
          <div className="mt-auto">
            <Button onClick={handleCodeNext} disabled={!validation.valid}>
              Далі
            </Button>
          </div>
        </div>
      )}

      {screen === 'consents' && (
        <div
          key="consents"
          className="flex flex-col gap-6 opacity-100 transition-opacity duration-200"
        >
          <h1 className="text-2xl font-semibold">Згода на обробку</h1>
          <div className="flex flex-col gap-4">
            <Label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={dataProcessing}
                onCheckedChange={(checked) => setDataProcessing(checked === true)}
              />
              <span>
                Я розумію, що мої відповіді будуть використані для формування профілю, і погоджуюсь
                на їх обробку у знеособленому вигляді.
              </span>
            </Label>
            <Label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={selfCompletion}
                onCheckedChange={(checked) => setSelfCompletion(checked === true)}
              />
              <span>
                Я підтверджую, що проходитиму анкету самостійно і без сторонньої допомоги.
              </span>
            </Label>
          </div>
          <div className="mt-auto">
            <Button onClick={handleStart} disabled={!dataProcessing || !selfCompletion}>
              Розпочати анкету
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
