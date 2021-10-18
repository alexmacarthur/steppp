import { Options, StepMovementArgs, CommittableAnimation, Frame, FrameDef, Direction} from './types';
import { buildAnimation, getHeight, fireCustomEvent, afterRepaint, isMovingBackward, flip } from './utils'
import defaultOptions from './defaultOptions';

function Steppp(element: HTMLElement, options: Options = defaultOptions) {
  const getStep = (stepIndex: number = getActiveStepIndex()): HTMLElement => {
    return steps[stepIndex];
  }

  const getStepByName = (stepName: string = "") => {
    return steps.find(step => step.dataset.stepppName === stepName);
  }

  const getActiveStepIndex = (): number => {
    return steps.findIndex(step => step.dataset.stepppActive !== undefined) || 0;
  }

  const moveTo = (stepName: string) => {
    moveStep({ stepName });
  }

  const forward = () => {
    moveStep();
  }

  const backward = () => {
    moveStep({ direction: 'backward' });
  }

  const animate = (args: any) => {
    args.options = {};
    return buildAnimation(args);
  }

  const queueAnimations = (oldStep: HTMLElement, newStep: HTMLElement, direction: Direction) => {
    const backward = isMovingBackward(direction);
    const { enter, exit } = animationFrames;
    
    return [
      animate({
        frames: backward ? flip(exit) : exit,
        targetElement: backward ? newStep : oldStep
      }),
      animate({
        frames: backward ? flip(enter) : enter,
        targetElement: backward ? oldStep : newStep
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

  const moveStep = async ({ stepName = "", direction = 'forward' }: StepMovementArgs = {}): Promise<void> => {
    if (currentAnimations.length) {
      currentAnimations.map(a => a.finish());
    }

    afterRepaint(async () => {
      const fallbackIncrementor = direction === 'forward' ? 1 : -1;
      const oldActiveStep = getStep();
      const newActiveStep = getStepByName(stepName) || getStep(getActiveStepIndex() + fallbackIncrementor);
      const eventArgs = {
        oldStep: oldActiveStep,
        newStep: newActiveStep,
        element
      };

      if (direction === 'forward' && !(await stepIsValid(getStep()))) {
        return fireCustomEvent({
          ...eventArgs,
          name: "steppp:invalid"
        });
      }

      if(!newActiveStep) {
        return fireCustomEvent({
          ...eventArgs,
          name: "steppp:abort"
        });
      }

      fireCustomEvent({
        ...eventArgs,
        name: "steppp:start"
      });

      afterRepaint(async () => {
        currentAnimations = queueAnimations(oldActiveStep, newActiveStep, direction);

        await Promise.all(currentAnimations.map(a => a.finished));

        currentAnimations.forEach((a: CommittableAnimation) => {
          a.commitStyles();
          a.persist();
        });

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

  const calculateWrapperHeight = (step: HTMLElement): number => {
    element.style.height = "";
    step.style.display = "block";
    const newHeight = getHeight(step);

    currentWrapperHeight = newHeight;

    return newHeight;
  }

  const computeAnimationFrames = (frames: Frame[] | FrameDef): FrameDef => {
    if(Array.isArray(frames)) {
      return {
        enter: frames,
        exit: [...frames.slice()].reverse()
      }
    }

    return frames;
  }

  options = {...defaultOptions, ...options};
  const stepWrapper = (element.querySelector('[data-steppp-wrapper]') || element) as HTMLElement;
  const mergedOptions: Options = { ...defaultOptions, ...options };
  const { stepIsValid } = mergedOptions;
  const steps = Array.from(stepWrapper.children) as HTMLElement[];
  const animationFrames: FrameDef = computeAnimationFrames(options.frames);
  let currentAnimations: CommittableAnimation[] = [];

  getStep().style.position = 'absolute';
  const currentStepHeight = getHeight(getStep());
  stepWrapper.style.height = `${currentStepHeight}px`;
  let currentWrapperHeight = currentStepHeight;

  element.querySelectorAll('[data-steppp-backward]').forEach(el => {
    el.addEventListener('click', backward);
  });

  element.querySelectorAll('[data-steppp-forward]').forEach(el => {
    el.addEventListener('click', forward);
  });

  element.querySelectorAll('[data-steppp-to]').forEach(el => {
    el.addEventListener('click', () => {
      moveTo((el as HTMLElement).dataset.stepppTo || "")
    });
  });

  return {
    backward,
    forward,
    moveTo
  }
}

Steppp.stepIsValid = (_slide: HTMLElement): boolean => true;

const element = document.getElementById('steppp');

if (element) {
  Steppp(element, {
    frames: {
      enter: [
        {
          transform: 'translateX(-100%)'
        },
        {
          transform: 'translateX(0)'
        }
      ],
      exit: [
        {
          transform: 'translateX(0)'
        },
        {
          transform: 'translateX(100%)'
        }
      ]
    }
    // frames: [
    //   {
    //     transform: 'translateX(-100%)'
    //   },
    //   {
    //     transform: 'translateX(0)'
    //   }
    // ]
  });

  // animation frames can either be array or object.

  // document.getElementById('forward')?.addEventListener('click', (_e) => {
  //   forward();
  // });

  // document.getElementById('backward')?.addEventListener('click', (_e) => {
  //   backward();
  // });
}

export default Steppp;
