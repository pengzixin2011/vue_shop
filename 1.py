class Dog():
    '''imitate dogs'''

    def __init__(self,name,age):
        '''restart'''
        self.name=name
        self.age=age
    def sit(self):
        print(self.name()+'is now sitting.')
    def roll_over(self):
        print(self.name()+'rolled over!')

my_dog=Dog("syman",2)
my_dog.sit()