import { buildAnimation, getHeight, fireCustomEvent } from './utils'

type Direction = `forward` | `backward`;
interface Options {
  stepIsValid: (step: HTMLElement) => Promise<boolean>;
}

const defaultOptions: Options = {
  stepIsValid: async (_step) => true
}

function Steppp(element: HTMLElement, options: Options = defaultOptions) {
  let mergedOptions: Options = {...defaultOptions, ...options};
  let { stepIsValid } = mergedOptions;
  let steps = Array.from(element.children) as HTMLElement[];
  let currentAnimations: Animation[] = [];
  let animationFrames = [
    {
      opacity: 0
    },
    {
      opacity: 1
    }
  ];

  const getStep = (stepIndex: number = getActiveStepIndex()): HTMLElement => {
    return steps[stepIndex];
  }

  const getStepByName = (stepName: string = "") => {
    return steps.find(step => step.dataset.step === stepName);
  }

  const getActiveStepIndex = (): number => {
    return steps.findIndex(step => step.dataset.stepppActive !== undefined) || 0;
  }

  const next = () => {
    moveStep();
  }

  const previous = () => {
    moveStep({ direction: 'backward' });
  }

  const animate = (args: any) => {
    // args.options = MultiStepController.animationOptions;
    args.options = {};
    return buildAnimation(args);
  }

  const queueAnimations = (oldStep: HTMLElement, newStep: HTMLElement) => {
    return [
      animate({
        frames: [...animationFrames.slice()].reverse(),
        targetElement: oldStep
      }),
      animate({
        frames: animationFrames,
        targetElement: newStep
      }),
      animate({
        frames: [
          {
            height: `${currentWrapperHeight}px`,
          },
          {
            height: `${calculateWrapperHeight(newStep)}px`
          }
        ],
        targetElement: element
      })
    ]
  }

  const moveStep = async ({ stepName = "", direction = 'forward' }: { stepName?: string, direction?: Direction } = {}): Promise<void> => {
    if (direction === 'forward' && !(await stepIsValid(getStep()))) {
      return;
    }

    const fallbackIncrementor = direction === 'forward' ? 1 : -1;
    const oldActiveStep = getStep();
    const newActiveStep = getStepByName(stepName) || getStep(getActiveStepIndex() + fallbackIncrementor);

    // An animation was already active. Reverse it.
    if (currentAnimations.length || !newActiveStep) {
      return;
    }

    fireCustomEvent({
      step: oldActiveStep,
      element,
      name: "steppp:start"
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        currentAnimations = queueAnimations(oldActiveStep, newActiveStep);

        await Promise.all(currentAnimations.map(a => a.finished));

        currentAnimations = [];

        oldActiveStep.style.display = "none";
        delete oldActiveStep.dataset.stepppActive;
        newActiveStep.dataset.stepppActive = "";

        fireCustomEvent({
          step: oldActiveStep,
          element,
          name: "steppp:complete"
        });
      });
    });
  }

  let currentStepHeight = getHeight(getStep());
  element.style.height = `${currentStepHeight}px`;
  let currentWrapperHeight = currentStepHeight;

  document.getElementById('previous')?.addEventListener('click', (_e) => {
    previous();
  });

  document.getElementById('next')?.addEventListener('click', (_e) => {
    next();
  });

  const calculateWrapperHeight = (step: HTMLElement): number => {
    element.style.height = "";
    step.style.display = "block";
    const newHeight = getHeight(step);

    currentWrapperHeight = newHeight;

    return newHeight;
  }
}

Steppp.stepIsValid = (_slide: HTMLElement): boolean => true;

const element = document.getElementById('steppp');

if (element) {
  Steppp(element, {
    stepIsValid: async (_step) => {
      return true;
    }
  });
}
