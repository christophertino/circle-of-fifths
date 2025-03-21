package circleoffifths

func Start() error {
	if err := Listen(); err != nil {
		return err
	}

	return nil
}
