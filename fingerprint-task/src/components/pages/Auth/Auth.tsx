import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, TextField, Typography } from '@material-ui/core';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { FormDataType, LoginDataType } from '../../../store/user/user.types';
import { loginUser } from '../../../store/user/user.slice';
import { AppDispatch } from '../../../store';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import styles from './styles.module.css';

const Auth: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [isLoading, setIsLoading] = useState(true);
  const [logArr, setLogArr] = useState([] as String[]);

  const [error, setError] = useState(false);
  const defaultValues = useMemo(() => {
    return {
      user: '',
      password: '',
    };
  }, []);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { ...defaultValues },
  });

  // Get visitorId from Fingerprint
  const { data } = useVisitorData();

  const visitorId = data?.visitorId;

  useEffect(() => {
    setIsLoading(false);
  }, [data?.visitorId]);

  const onSubmit: SubmitHandler<FormDataType> = async (formData) => {
    let tempLogArr = [] as String[];
    setIsLoading(true);
    if (visitorId) {
      const credData: LoginDataType = {
        ...formData,
        visitorId,
      };
      let { payload } = await dispatch(loginUser(credData));
      const { status, totallyBlocked, user, expires, error } = payload;

      if (status) {
        // The case when we checked combination of user and password
        tempLogArr.push(
          `We tried to log in with the provided credentials: login=${formData.user}`
        );
        if (error) {
          // The combination was wrong
          tempLogArr.push(error);
          setError(true);
          setTimeout(() => {
            setError(false);
          }, 3000);
          setIsLoading(false);
        } else {
          // User successfully logged in
          tempLogArr.push(`User '${user}' logged in!`);
        }
      } else {
        if (totallyBlocked) {
          // This user is totally blocked
          tempLogArr.push(
            `We detected multiple log in attempts for this user, and we didn't perform the login action anymore.`
          );
        } else if (expires) {
          // This user is blocked for 5 minutes only
          tempLogArr.push(
            `We detected multiple log in attempts for this user, and we didn't perform the login action. Login '${user}' was locked for 5 minutes. Try later.`
          );
          setIsLoading(false);
        } else {
          // Some errors or visitorId is wrong
          tempLogArr.push(
            `We detected some strange activity with login '${user}', and we didn't perform the login action.`
          );
        }
      }
      setLogArr([...logArr, ...tempLogArr]);
    }
  };

  return (
    <Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box className={styles.loginForm}>
          <Typography variant="h2" align="center" gutterBottom>
            Sign In
          </Typography>
          {error && (
            <Typography className={styles.error} variant="body1">
              Incorrect Login or Password
            </Typography>
          )}
          <Controller
            name="user"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                className={styles.input}
                type="login"
                label="Login*"
                autoComplete="username"
                variant="outlined"
                size="small"
                {...field}
              />
            )}
          />
          {errors.user && (
            <Typography className={styles.error} variant="body1">
              Login is required
            </Typography>
          )}
          <Controller
            name="password"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                className={styles.input}
                type="password"
                label="Password*"
                autoComplete="current-password"
                variant="outlined"
                size="small"
                {...field}
              />
            )}
          />
          {errors.password && (
            <Typography className={styles.error} variant="body1">
              Password is required
            </Typography>
          )}
          <Button type="submit" variant="outlined" disabled={isLoading}>
            Submit
          </Button>
        </Box>
      </form>
      <Box className={styles.logBlockWrap}>
        <Box className={styles.logBlock}>
          <Typography variant="h4" align="center" gutterBottom>
            Log
          </Typography>
          {logArr.map((logItem: String, index) => (
            <Typography
              variant="body1"
              className={styles.logBlockMessage}
              key={index}
            >
              {logItem}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Auth;
