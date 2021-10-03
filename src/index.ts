import { buildAnimation, getHeight, fireCustomEvent, afterRepaint } from './utils'

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
    return steps.find(step => step.dataset.stepppName === stepName);
  }

  const getActiveStepIndex = (): number => {
    return steps.findIndex(step => step.dataset.stepppActive !== undefined) || 0;
  }

  const next = (e: Event) => {
    moveStep({stepName: (e!.target as HTMLElement)?.dataset?.stepppGoTo || ''});
  }

  const previous = () => {
    moveStep({ direction: 'backward' });
  }

  const animate = (args: any) => {
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

    if (currentAnimations.length) {
      currentAnimations.map(a => a.finish());
    }

    afterRepaint(() => {
      const fallbackIncrementor = direction === 'forward' ? 1 : -1;
      const oldActiveStep = getStep();
      const newActiveStep = getStepByName(stepName) || getStep(getActiveStepIndex() + fallbackIncrementor);
      const eventArgs = {
        oldStep: oldActiveStep,
        newStep: newActiveStep,
        element
      };

      if(!newActiveStep) {
        fireCustomEvent({
          ...eventArgs,
          name: "steppp:abort"
        });

        return;
      }

      fireCustomEvent({
        ...eventArgs,
        name: "steppp:start"
      });

      afterRepaint(async () => {
        currentAnimations = queueAnimations(oldActiveStep, newActiveStep);

        await Promise.all(currentAnimations.map(a => a.finished));

        currentAnimations = [];

        oldActiveStep.style.display = "none";
        delete oldActiveStep.dataset.stepppActive;
        newActiveStep.dataset.stepppActive = "";

        fireCustomEvent({
          ...eventArgs,
          name: "steppp:complete"
        });
      });
    });
  }

  getStep().style.position = 'absolute';
  let currentStepHeight = getHeight(getStep());
  element.style.height = `${currentStepHeight}px`;
  let currentWrapperHeight = currentStepHeight;

  document.getElementById('previous')?.addEventListener('click', (_e) => {
    previous();
  });

  document.getElementById('next')?.addEventListener('click', (_e) => {
    next(_e);
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

export default Steppp;
