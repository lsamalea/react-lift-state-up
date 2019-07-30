import React, { Component } from 'react';
import { render } from 'react-dom';
import Hello from './Hello';
import './style.css';
import * as R from 'ramda'

const BoilingVeredict = ({ celsius }) => celsius > 180 ?
  <p> The water would boild </p> :
  <p> The water would not boild </p>;

const createLoggerComponent = (Component) => (props) => {
//  console.log(props);
  return <Component {...props} />
}

const safeParse = R.pipe(R.tryCatch(parseFloat, R.always(0)), R.when(isNaN, R.always(0)));

const BoilingVeredictWithLogging = createLoggerComponent(BoilingVeredict);

const toCelsius = (fahrenheit) => (fahrenheit - 32) * 5 / 9;
const toFahrenheit = (celsius) => celsius * 9 / 5 + 32;

const CELSIUS = 'celsius',
const FAHRENHEIT = 'fahrenheit';

const scaleSettings = {
  [CELSIUS]: {
    label: 'celsius',
    converter: toCelsius
  },
  [FAHRENHEIT]: {
    label: 'fahrenheit',
    converter: toFahrenheit
  },
};

const resolveConverter = (scale) => scaleSettings[scale].converter;

const debugFn = (fn) => (...params) =>  {
  debugger;
  return fn(...params);
}

const safeConvert = (convert, temperature) => {
  const convertAndRound = R.pipe(
    safeParse,
    convert,
    R.multiply(1000),
    Math.round.bind(Math),
    R.flip(R.divide)(1000)
  );
  return convertAndRound(temperature);
}

const safeConvertToCelsius = R.partial(safeConvert, [resolveConverter(CELSIUS)]);
const safeConvertToFahrenheit = R.partial(safeConvert, [resolveConverter(FAHRENHEIT)]);

class Temperature extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange({ target }) {
    const { value } = target;
    const { scale } = this.props;
    this.props.onChange({
      scale,
      temperature: value
    })
  }

  render() {
    const { temperature, scale } = this.props;
    const { label } = scaleSettings[scale];
    const celsius = scale === CELSIUS ?
      temperature :
      toCelsius(temperature);
      console.log(celsius, temperature)
    return (
      <fieldset>
        <legend> Enter temperature in {label}: </legend>
        <input type="input" value={temperature} onChange={this.onChange} />
        <BoilingVeredictWithLogging celsius={celsius} />
      </fieldset>
    );
  }
}

class Calculator extends Component {
  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.state = {
      temperature: 0,
      scale: CELSIUS
    };
  }

  onChange({ scale, temperature }) {
    this.setState({
      temperature: safeParse(temperature),
      scale
    });
  }

  createViewModel() {

  }

  render() {
    const { temperature, scale } = this.state;
    // todo create temperature viewmodel component 
    const celsius = scale === CELSIUS ? temperature: safeConvertToCelsius(temperature);
    // todo create temperature viewmodel component
    const fahrenheit = scale === FAHRENHEIT ? temperature: safeConvertToFahrenheit(temperature);
    
    return (
      <>
        <Temperature scale={CELSIUS} temperature={celsius} onChange={this.onChange} />
        <Temperature scale={FAHRENHEIT} temperature={fahrenheit} onChange={this.onChange} />
      </>
    );
  }
}

render(<Calculator />, document.getElementById('root'));
